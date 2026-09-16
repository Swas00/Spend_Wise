# SpendWise — Personal Expense Tracker & Campus Treasury

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000.svg?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-purple.svg)](https://web.dev/progressive-web-apps/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

> **SpendWise** is a full-stack, modern personal finance tracker and campus treasury tailored specifically for Indian college and university students. Built with clean English, authentic Indian financial context (`₹`, `en-IN` numbering, UPI, hostel mess, metro passes, xerox), an autonomous AI financial advisor, a shared roommate bill splitter, and a 5-palette modern fintech theme engine.

---

## ✨ Key Features

- 🌿 **Premier Fintech Aesthetic & 5-Theme Engine**:
  - Switch on the fly between **Emerald Mint** (Modern Fintech), **Electric Indigo** (Cyber Studio), **Ocean Azure** (Neo-Bank), **Royal Rose** (Velvet Crimson), and **Golden Amber** (Warm Classic).
  - High-contrast Dark and Light modes with subtle glassmorphism and ambient video background.
  - Crisp typography using Google Font **Plus Jakarta Sans** with tabular numeric formatting.
- 💰 **Campus Financial Command Center**:
  - Real-time liquid balance, monthly pocket money inflows, expenses, remaining budget cap, and daily safe spending velocity.
  - Dynamic student achievement badges: *Frugal Scholar* (zero-spend days), *Budget Master*, *Savvy Saver*, and *Faithful Auditor*.
- 🧾 **Campus Expense & Allowance Ledger**:
  - 11 Tailored Categories: Food & Canteen, Transport & Commute, College & Academics, Hostel & PG, Mobile & Data, Outings & Leisure, Shopping & Market, Medical & Health, OTT & Subscriptions, Fests & Events, and Other.
  - Payment modes: UPI (GPay/PhonePe/Paytm), Cash, Debit/RuPay Card, Credit Card, Net Banking, and Campus Wallet.
  - Smart Indian natural language parser (e.g., `"Swiggy 320"`, `"Metro 45"`, `"Hostel rent 6500"`).
- 👥 **Roommate & Shared Bill Splitter**:
  - Split flat rent, groceries, electricity, and outings with friends and flatmates.
  - Automated per-head calculations, receivables tracking ("Total Owed to You"), and 1-click payment settlements.
- 🤖 **Campus AI Financial Advisor**:
  - Context-aware intelligence answering affordability queries (*"Can I afford a ₹2,500 trip?"*), canteen spending limits, and month-end burn rate forecasting.
- 📑 **Guardian Statements & 1-Click CSV Export**:
  - Printable official financial statements with verified vouchers and monthly surplus audits.
  - 1-click spreadsheet download (`.csv`).
- 📱 **Progressive Web App (PWA)**:
  - Installable directly to your home screen or desktop application dock with offline caching and responsive layouts.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Recharts, React Router 7.
- **Backend**: Node.js, Express 5, Mongoose ODM, JWT Authentication (bcryptjs).
- **Database**: MongoDB (Local or MongoDB Atlas Cloud).
- **Deployment**: Render, Vercel, Docker (`Dockerfile` and `docker-compose.yml` included).

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/spendwise.git
   cd spendwise
   ```

2. **Install all dependencies (Root, Backend & Frontend)**:
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/expense_tracker
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```

4. **Start the development servers**:
   In two separate terminal tabs:

   **Backend API Server**:
   ```bash
   npm run server
   # Runs on http://127.0.0.1:5001
   ```

   **Frontend Vite Dev Server**:
   ```bash
   npm run client
   # Runs on http://localhost:5173
   ```

---

## 🌐 Production Cloud Deployment

### Option A: Free 1-Click Deploy on Render (Recommended)

SpendWise includes a `render.yaml` blueprint that deploys the unified application (Frontend + Backend) as a single Web Service:

1. Push your repository to **GitHub**.
2. Sign up / Log in to [Render](https://render.com/).
3. Click **New +** &rarr; **Blueprint** (or **Web Service**) &rarr; Select your GitHub repository.
4. If creating as a Web Service:
   - **Environment**: `Node`
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `node backend/server.js`
5. Add the environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5001`
   - `MONGO_URI`: *Your free connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)*
   - `JWT_SECRET`: *Any secure random string*
6. Click **Deploy Web Service**. Render will build the optimized React SPA and serve it via Express.

---

### Option B: Separate Frontend (Vercel) & Backend (Render/Railway)

1. **Backend**:
   - Deploy `backend/` on Render or Railway.
   - Note your live backend URL: `https://your-api.onrender.com`.
2. **Frontend on Vercel**:
   - Import your repo on [Vercel](https://vercel.com/).
   - Set **Root Directory** to `frontend`.
   - Set Environment Variable: `VITE_API_URL=https://your-api.onrender.com`.
   - Deploy!

---

### Option C: Docker & Docker Compose

SpendWise comes with containerization ready out of the box:

```bash
# Build and run the app + MongoDB container in the background
docker-compose up --build -d

# Open http://localhost:5001 in your browser
```

---

## 📄 License

This project is licensed under the ISC License.
