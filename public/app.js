const translations = {
    en: {
        title: "🎄 Christmas Wishlist",
        loginHeading: "Login",
        signupHeading: "Sign Up",
        username: "Username",
        password: "Password",
        loginBtn: "Login",
        signupBtn: "Sign Up",
        noAccount: "Don't have an account?",
        hasAccount: "Already have an account?",
        signupLink: "Sign up",
        loginLink: "Login",
        welcome: "Welcome",
        logout: "Logout",
        createListHeading: "Create New Wishlist",
        listTitlePlaceholder: "Wishlist Title (e.g. Christmas 2026)",
        createListBtn: "Create List",
        myListsHeading: "My Wishlists",
        shareLinkText: "Share Link (View-Only):",
        copyBtn: "Copy",
        addItemHeading: "Add Wish",
        itemNamePlaceholder: "Wish Name (e.g. Headphones)",
        itemLinkPlaceholder: "Product Link (URL)",
        itemImgPlaceholder: "Photo Image URL",
        addItemBtn: "Add Item",
        deleteListBtn: "Delete Wishlist",
        deleteItemBtn: "Delete",
        sharedViewTitle: "Shared Christmas Wishlist",
        viewLink: "View Product",
        backToHome: "Go to My Wishlists",
        footer: "🎄 Merry Christmas & Happy Holidays! 🎁",
        copied: "Copied!"
    },
    de: {
        title: "🎄 Weihnachts-Wunschzettel",
        loginHeading: "Anmelden",
        signupHeading: "Registrieren",
        username: "Benutzername",
        password: "Passwort",
        loginBtn: "Anmelden",
        signupBtn: "Registrieren",
        noAccount: "Noch kein Konto?",
        hasAccount: "Bereits ein Konto?",
        signupLink: "Registrieren",
        loginLink: "Anmelden",
        welcome: "Willkommen",
        logout: "Abmelden",
        createListHeading: "Neuen Wunschzettel erstellen",
        listTitlePlaceholder: "Titel (z.B. Weihnachten 2026)",
        createListBtn: "Liste erstellen",
        myListsHeading: "Meine Wunschzettel",
        shareLinkText: "Teil-Link (Nur-Ansicht):",
        copyBtn: "Kopieren",
        addItemHeading: "Wunsch hinzufügen",
        itemNamePlaceholder: "Wunsch (z.B. Kopfhörer)",
        itemLinkPlaceholder: "Produkt-Link (URL)",
        itemImgPlaceholder: "Bild-URL (Foto)",
        addItemBtn: "Wunsch hinzufügen",
        deleteListBtn: "Wunschzettel löschen",
        deleteItemBtn: "Löschen",
        sharedViewTitle: "Geteilter Weihnachts-Wunschzettel",
        viewLink: "Produkt ansehen",
        backToHome: "Zu meinen Wunschzetteln",
        footer: "🎄 Frohe Weihnachten & Schöne Feiertage! 🎁",
        copied: "Kopiert!"
    }
};

let currentLang = 'en';
let isSignupMode = false;

function t(key) {
    return translations[currentLang][key] || key;
}

function updateLanguageUI() {
    document.getElementById('app-title').textContent = t('title');
    document.getElementById('authHeading').textContent = isSignupMode ? t('signupHeading') : t('loginHeading');
    document.getElementById('labelUsername').textContent = t('username');
    document.getElementById('labelPassword').textContent = t('password');
    document.getElementById('authSubmitBtn').textContent = isSignupMode ? t('signupBtn') : t('loginBtn');
    
    const toggleText = document.getElementById('authToggleText');
    const toggleLink = document.getElementById('authToggleLink');
    if (isSignupMode) {
        toggleText.textContent = t('hasAccount');
        toggleLink.textContent = t('loginLink');
    } else {
        toggleText.textContent = t('noAccount');
        toggleLink.textContent = t('signupLink');
    }

    document.getElementById('createListHeading').textContent = t('createListHeading');
    document.getElementById('listTitle').placeholder = t('listTitlePlaceholder');
    document.getElementById('createListBtn').textContent = t('createListBtn');
    document.getElementById('myListsHeading').textContent = t('myListsHeading');
    document.getElementById('backToHomeBtn').textContent = t('backToHome');
    document.getElementById('footerText').textContent = t('footer');
}

document.getElementById('langToggle').addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'de' : 'en';
    updateLanguageUI();
    checkSession();
});

document.getElementById('authToggleLink').addEventListener('click', (e) => {
    e.preventDefault();
    isSignupMode = !isSignupMode;
    updateLanguageUI();
});

document.getElementById('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const endpoint = isSignupMode ? '/api/signup' : '/api/login';

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            document.getElementById('authError').textContent = '';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            checkSession();
        } else {
            document.getElementById('authError').textContent = data.error || 'Authentication failed';
        }
    } catch (err) {
        document.getElementById('authError').textContent = 'Network error';
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    checkSession();
});

async function checkSession() {
    const pathSegments = window.location.pathname.split('/');
    if (pathSegments[1] === 'share' && pathSegments[2]) {
        loadSharedWishlist(pathSegments[2]);
        return;
    }

    try {
        const res = await fetch('/api/session');
        const data = await res.json();
        if (data.loggedIn) {
            document.getElementById('authContainer').classList.remove('active');
            document.getElementById('sharedContainer').classList.remove('active');
            document.getElementById('dashboardContainer').classList.add('active');
            document.getElementById('welcomeUser').textContent = `${t('welcome')}, ${data.username}!`;
            loadWishlists();
        } else {
            document.getElementById('dashboardContainer').classList.remove('active');
            document.getElementById('sharedContainer').classList.remove('active');
            document.getElementById('authContainer').classList.add('active');
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadWishlists() {
    try {
        const res = await fetch('/api/wishlists');
        const lists = await res.json();
        const container = document.getElementById('wishlistsContainer');
        container.innerHTML = '';

        if (lists.length === 0) {
            container.innerHTML = `<p style="color: #666; font-style: italic;">${currentLang === 'en' ? 'No wishlists yet. Create one above!' : 'Noch keine Wunschzettel. Erstelle einen oben!'}</p>`;
            return;
        }

        for (const list of lists) {
            const card = document.createElement('div');
            card.className = 'wishlist-card';
            
            const shareUrl = `${window.location.origin}/share/${list.share_code}`;

            card.innerHTML = `
                <div class="wishlist-header">
                    <h3>🎁 ${list.title}</h3>
                    <button class="delete-btn" onclick="deleteWishlist(${list.id})">${t('deleteListBtn')}</button>
                </div>
                <div class="share-box">
                    <span>${t('shareLinkText')}</span>
                    <input type="text" readonly value="${shareUrl}" onclick="this.select()" style="flex:1; padding: 6px; border-radius:4px; border:1px solid #ccc;">
                    <button class="btn" style="padding: 6px 12px; font-size:0.85rem;" onclick="navigator.clipboard.writeText('${shareUrl}'); alert('${t('copied')}');">${t('copyBtn')}</button>
                </div>
                <div class="items-grid" id="items-grid-${list.id}"></div>
                <form class="add-item-form" onsubmit="addItem(event, ${list.id})">
                    <input type="text" placeholder="${t('itemNamePlaceholder')}" name="name" required>
                    <input type="url" placeholder="${t('itemLinkPlaceholder')}" name="link">
                    <input type="url" placeholder="${t('itemImgPlaceholder')}" name="image_url">
                    <button type="submit" class="btn" style="padding: 8px 14px; font-size:0.9rem;">${t('addItemBtn')}</button>
                </form>
            `;
            container.appendChild(card);
            loadItems(list.id);
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadItems(wishlistId) {
    try {
        const res = await fetch(`/api/wishlists/${wishlistId}/items`);
        const items = await res.json();
        const grid = document.getElementById(`items-grid-${wishlistId}`);
        if (!grid) return;
        grid.innerHTML = '';

        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            const imgSrc = item.image_url ? item.image_url : 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=400&q=80';
            
            itemCard.innerHTML = `
                <div>
                    <img src="${imgSrc}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=400&q=80'">
                    <h4>${item.name}</h4>
                </div>
                <div>
                    ${item.link ? `<a href="${item.link}" target="_blank">${t('viewLink')} ↗</a>` : ''}
                    <button class="delete-btn" style="width:100%; margin-top: 8px;" onclick="deleteItem(${item.id})">${t('deleteItemBtn')}</button>
                </div>
            `;
            grid.appendChild(itemCard);
        });
    } catch (err) {
        console.error(err);
    }
}

document.getElementById('createListForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('listTitle').value;
    const res = await fetch('/api/wishlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });
    if (res.ok) {
        document.getElementById('listTitle').value = '';
        loadWishlists();
    }
});

async function deleteWishlist(id) {
    if (!confirm(currentLang === 'en' ? 'Are you sure you want to delete this wishlist?' : 'Möchtest du diesen Wunschzettel wirklich löschen?')) return;
    await fetch(`/api/wishlists/${id}`, { method: 'DELETE' });
    loadWishlists();
}

async function addItem(e, wishlistId) {
    e.preventDefault();
    const form = e.target;
    const name = form.elements['name'].value;
    const link = form.elements['link'].value;
    const image_url = form.elements['image_url'].value;

    const res = await fetch(`/api/wishlists/${wishlistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, link, image_url })
    });

    if (res.ok) {
        form.reset();
        loadItems(wishlistId);
    }
}

async function deleteItem(id) {
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    loadWishlists();
}

async function loadSharedWishlist(code) {
    try {
        const res = await fetch(`/api/shared/${code}`);
        const data = await res.json();
        if (!res.ok) {
            document.getElementById('app-title').textContent = t('title');
            document.getElementById('authContainer').classList.remove('active');
            document.getElementById('dashboardContainer').classList.remove('active');
            const sharedContainer = document.getElementById('sharedContainer');
            sharedContainer.classList.add('active');
            document.getElementById('sharedTitle').textContent = currentLang === 'en' ? 'Wishlist not found ❌' : 'Wunschzettel nicht gefunden ❌';
            document.getElementById('sharedSubtitle').textContent = '';
            document.getElementById('sharedItemsGrid').innerHTML = '';
            return;
        }

        document.getElementById('authContainer').classList.remove('active');
        document.getElementById('dashboardContainer').classList.remove('active');
        const sharedContainer = document.getElementById('sharedContainer');
        sharedContainer.classList.add('active');

        document.getElementById('sharedTitle').textContent = `🎁 ${data.wishlist.title}`;
        document.getElementById('sharedSubtitle').textContent = `${currentLang === 'en' ? 'Wishlist created by' : 'Wunschzettel von'} ${data.wishlist.username}`;

        const grid = document.getElementById('sharedItemsGrid');
        grid.innerHTML = '';

        if (data.items.length === 0) {
            grid.innerHTML = `<p style="grid-column: 1/-1; color: #666; font-style: italic;">${currentLang === 'en' ? 'This wishlist is currently empty.' : 'Dieser Wunschzettel ist derzeit leer.'}</p>`;
            return;
        }

        data.items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            const imgSrc = item.image_url ? item.image_url : 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=400&q=80';

            itemCard.innerHTML = `
                <div>
                    <img src="${imgSrc}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=400&q=80'">
                    <h4>${item.name}</h4>
                </div>
                <div>
                    ${item.link ? `<a href="${item.link}" target="_blank">${t('viewLink')} ↗</a>` : ''}
                </div>
            `;
            grid.appendChild(itemCard);
        });

    } catch (err) {
        console.error(err);
    }
}

document.getElementById('backToHomeBtn').addEventListener('click', () => {
    window.location.href = '/';
});

checkSession();