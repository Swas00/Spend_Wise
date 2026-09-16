# SpendWise — Production Deployment & App Installation Guide

This guide details how to deploy **SpendWise** live to the cloud and how to install it as a standalone app on your desktop (macOS/Windows) and mobile devices (iOS/Android).

---

## Step 1: Free Cloud Database Setup (MongoDB Atlas)

To access your expense tracker from anywhere (phone, work laptop, production server), configure a free cloud MongoDB database:

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Click **Create Deployment** &rarr; select the **M0 Free** cluster.
3. In **Database Access**, create a user with username and password (remember these credentials).
4. In **Network Access**, click **Add IP Address** &rarr; choose **Allow Access From Anywhere (`0.0.0.0/0`)**.
5. Go to **Database** &rarr; click **Connect** &rarr; **Drivers** &rarr; copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/expense_tracker?retryWrites=true&w=majority
   ```

---

## Step 2: Deploying to the Cloud

### Option A: 1-Click Deploy on Render (Recommended & Free)

Render allows you to deploy the unified SpendWise application (Backend + Frontend) in one free Web Service:

1. Push your repository to **GitHub**.
2. Sign up / Log in to [Render.com](https://render.com/).
3. Click **New +** &rarr; **Web Service** &rarr; Connect your GitHub repository.
4. Configure the service:
   - **Name**: `spendwise`
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm run install:all && npm run build
     ```
   - **Start Command**:
     ```bash
     node backend/server.js
     ```
5. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5001`
   - `MONGO_URI`: *Your MongoDB Atlas connection string from Step 1*
6. Click **Deploy Web Service**!
7. Render will build the optimized React app and start the server. Your live app URL will be:
   `https://spendwise.onrender.com`

---

### Option B: Deploy with Docker

SpendWise includes a production-ready multi-stage `Dockerfile` and `docker-compose.yml`.

#### 1. Run Everything Locally with Docker (App + Database):
```bash
docker-compose up --build -d
```
Your app is now running with its own containerized database at:
`http://localhost:5001`

#### 2. Run on any Cloud VPS (DigitalOcean, AWS, Hetzner, Linode):
Clone your repo onto the VPS and run:
```bash
docker-compose up -d
```

---

### Option C: Separate Deployments (Frontend on Vercel + Backend on Render/Railway)

If you prefer hosting the React frontend on Vercel:

1. **Deploy Backend**: Follow Step 2 (Option A) to deploy `backend` on Render or Railway.
2. **Deploy Frontend on Vercel**:
   - Go to [Vercel.com](https://vercel.com/) &rarr; Import your GitHub repo.
   - Set **Root Directory** to `frontend`.
   - In **Environment Variables**, add:
     - `VITE_API_URL`: `https://your-backend.onrender.com/api/expenses`
   - Deploy! `frontend/vercel.json` already handles SPA client-side routes.

---

## Step 3: Installing SpendWise as a Standalone App (PWA)

SpendWise is configured as an installable **Progressive Web App (PWA)** with an offline service worker and web app manifest.

### On macOS / Windows / Linux (Chrome & Edge)
1. Open your deployed URL (or `http://localhost:5173/` or `http://localhost:5001/`) in Chrome or Edge.
2. Click the **"Install App"** golden button in the SpendWise navigation bar, or click the **Install icon** on the right side of your browser's address bar.
3. Click **Install**.
4. SpendWise now opens as a dedicated window without browser navigation, has its own app icon in your macOS Dock / Windows Taskbar, and can be launched like any native application!

### On iPhone & iPad (Safari)
1. Open your deployed SpendWise URL in Safari.
2. Tap the **Share** button (the square with an arrow pointing up).
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add**. SpendWise will appear as an app icon on your home screen and open full-screen.

### On Android (Chrome)
1. Open your deployed SpendWise URL in Chrome.
2. Tap the **"Install App"** button in the navbar or tap the three dots `⋮` in Chrome &rarr; **Install App** / **Add to Home Screen**.

---

## Local Production Testing Command

To verify the unified production build on your computer right now:
```bash
# 1. Build frontend
npm run build

# 2. Run production server
npm start
```
Then visit `http://localhost:5001/` to see the production server serving both the React app and API endpoints on a single port!
