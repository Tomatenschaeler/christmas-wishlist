# 🎄 Christmas Wishlist Web App

A sleek, festive Christmas wishlist web application built with Node.js, Express, and SQLite. Features user authentication with secure password hashing (bcrypt), multi-language support (English & German), wishlist creation with item photos and links, and unique view-only shareable links.

## Features
- **User Authentication:** Sign up and log in securely with username and password.
- **Wishlist Management:** Create multiple Christmas wishlists, add wishes with item names, product links, and photo URLs.
- **View-Only Sharing:** Generate unique shareable links (`/share/[code]`) so family and friends can browse and click links without being able to edit your list.
- **Sleek Christmas Design:** Festive red, forest green, and gold theme with snowy ambient styling.
- **Bilingual (English / German):** Instantly switch between English and German UI.

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### Installation & Running Locally
1. Open a terminal in the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to:
   `http://localhost:3000`

## Publishing & Deployment
You can easily deploy this app to cloud hosting platforms like Render, Railway, Fly.io, or Heroku:
1. Push this folder to a GitHub repository.
2. Create a new Web Service on [Render](https://render.com/) or [Railway](https://railway.app/).
3. Set the Start Command to: `npm start`
4. Deploy! Your Christmas wishlist app will be live on the web with a persistent SQLite database.
