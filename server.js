const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const crypto = require('crypto');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'christmas-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
};

app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
            if (err) {
                return res.status(400).json({ error: 'Username already taken' });
            }
            req.session.userId = this.lastID;
            req.session.username = username;
            res.json({ success: true, username });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.userId = user.id;
            req.session.username = user.username;
            res.json({ success: true, username: user.username });
        } else {
            res.status(400).json({ error: 'Invalid username or password' });
        }
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

app.get('/api/session', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/api/wishlists', isAuthenticated, (req, res) => {
    db.all('SELECT * FROM wishlists WHERE user_id = ?', [req.session.userId], (err, lists) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(lists);
    });
});

app.post('/api/wishlists', isAuthenticated, (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const shareCode = crypto.randomBytes(6).toString('hex');
    db.run('INSERT INTO wishlists (user_id, title, share_code) VALUES (?, ?, ?)', [req.session.userId, title, shareCode], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ id: this.lastID, title, share_code: shareCode });
    });
});

app.delete('/api/wishlists/:id', isAuthenticated, (req, res) => {
    const wishlistId = req.params.id;
    db.run('DELETE FROM wishlists WHERE id = ? AND user_id = ?', [wishlistId, req.session.userId], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        db.run('DELETE FROM items WHERE wishlist_id = ?', [wishlistId]);
        res.json({ success: true });
    });
});

app.get('/api/wishlists/:id/items', isAuthenticated, (req, res) => {
    const wishlistId = req.params.id;
    db.get('SELECT * FROM wishlists WHERE id = ? AND user_id = ?', [wishlistId, req.session.userId], (err, list) => {
        if (err || !list) return res.status(403).json({ error: 'Forbidden' });
        db.all('SELECT * FROM items WHERE wishlist_id = ?', [wishlistId], (err, items) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(items);
        });
    });
});

app.post('/api/wishlists/:id/items', isAuthenticated, (req, res) => {
    const wishlistId = req.params.id;
    const { name, link, image_url } = req.body;
    if (!name) return res.status(400).json({ error: 'Item name required' });

    db.get('SELECT * FROM wishlists WHERE id = ? AND user_id = ?', [wishlistId, req.session.userId], (err, list) => {
        if (err || !list) return res.status(403).json({ error: 'Forbidden' });
        db.run('INSERT INTO items (wishlist_id, name, link, image_url) VALUES (?, ?, ?, ?)', 
            [wishlistId, name, link || '', image_url || ''], function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ id: this.lastID, wishlist_id: wishlistId, name, link, image_url });
        });
    });
});

app.delete('/api/items/:id', isAuthenticated, (req, res) => {
    const itemId = req.params.id;
    db.get(`SELECT items.* FROM items JOIN wishlists ON items.wishlist_id = wishlists.id WHERE items.id = ? AND wishlists.user_id = ?`, 
        [itemId, req.session.userId], (err, item) => {
        if (err || !item) return res.status(403).json({ error: 'Forbidden' });
        db.run('DELETE FROM items WHERE id = ?', [itemId], (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ success: true });
        });
    });
});

app.get('/api/shared/:code', (req, res) => {
    const shareCode = req.params.code;
    db.get(`SELECT wishlists.*, users.username FROM wishlists JOIN users ON wishlists.user_id = users.id WHERE wishlists.share_code = ?`, 
        [shareCode], (err, list) => {
        if (err || !list) return res.status(404).json({ error: 'Wishlist not found' });
        db.all('SELECT * FROM items WHERE wishlist_id = ?', [list.id], (err, items) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ wishlist: list, items });
        });
    });
});

// SPA fallback for share URLs
app.get('/share/:code', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});