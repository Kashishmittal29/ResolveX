# CampusConnect Deployment Guide

This guide details the step-by-step process of deploying the **CampusConnect** campus complaint system. The backend will be hosted on **Render** (connected to a **MongoDB Atlas** database), and the frontend will be hosted on **Vercel**.

---

## 🛠️ Step 1: Database Setup (MongoDB Atlas)

Before deploying the backend, you need a cloud-hosted MongoDB database.

1. **Sign Up/Log In**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in.
2. **Create a Cluster**: 
   - Deploy a free-tier cluster (`M0 Sandbox`) in your preferred region.
3. **Configure Database Access**:
   - Create a database user (e.g., username: `campusconnect-admin`, set a secure password).
4. **Configure Network Access**:
   - In **Network Access**, add an IP entry. For ease of deployment, choose **Allow Access from Anywhere** (`0.0.0.0/0`) so Render instances can connect.
5. **Get the Connection String**:
   - Click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string. It will look like this:
     ```text
     mongodb+srv://campusconnect-admin:<password>@cluster0.xxxx.mongodb.net/campusconnect?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user's password.

---

## 🚀 Step 2: Backend Deployment (Render)

Render is perfect for hosting node/express applications.

1. **Log In to Render**: Go to [Render](https://render.com/) and log in with GitHub.
2. **Create a New Web Service**:
   - Click **New +** and select **Web Service**.
   - Connect your GitHub repository containing the CampusConnect code.
3. **Configure Service Settings**:
   - **Name**: `campusconnect-backend`
   - **Region**: Select a region close to your target users.
   - **Branch**: `main`
   - **Root Directory**: `backend` *(This runs commands inside the backend folder)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
 4. **Configure Environment Variables**:
   Click the **Advanced** button and add the following environment variables:

   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production mode |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string from Step 1 |
   | `JWT_SECRET` | `a8f3d2e1b9c4f7a2d5e8b1c4f7a2d5e8b1c4f7a2d5e8b1c4f7a2d5e8` | Secret key used for signing user auth tokens |
   | `JWT_EXPIRE` | `7d` | Token expiry duration |
   | `PORT` | `10000` | Port for the Render server (Render configures this automatically) |
   | `CLOUDINARY_CLOUD_NAME` | `doszkxo4n` | Cloudinary Cloud Name for image storage |
   | `CLOUDINARY_API_KEY` | `749963614788946` | Cloudinary API Key |
   | `CLOUDINARY_API_SECRET` | `gTmQN62Iak09l2y88g2ztApyd54` | Cloudinary API Secret |
   | `UPLOAD_PATH` | `./uploads` | Temporary upload path |
   | `MAX_FILE_SIZE` | `5242880` | Maximum file upload size in bytes (5MB) |
   | `EMAIL_HOST` | `smtp.gmail.com` | SMTP host for email service |
   | `EMAIL_PORT` | `587` | SMTP port |
   | `EMAIL_USER` | `ks9034214356@gmail.com` | Email user for SMTP |
   | `EMAIL_PASS` | `jqmksjzxcymyveki` | App password for Gmail SMTP |
   | `EMAIL_FROM` | `noreply@campusconnect.edu` | Sender address for emails |
   | `FIREBASE_SERVICE_ACCOUNT_JSON` | `{"type": "service_account", ...}` | Stringified Firebase Service Account JSON key (for Production) |

5. **Deploy**:
   - Click **Create Web Service**. Render will build and deploy the backend. Once active, note down the provided URL (e.g., `https://campusconnect-backend.onrender.com`).

---

## ⚡ Step 3: Frontend Deployment (Vercel)

Vercel is optimized for building and serving static single-page React/Vite frontends.

1. **Log In to Vercel**: Go to [Vercel](https://vercel.com/) and log in with GitHub.
2. **Import Project**:
   - Click **Add New** > **Project**.
   - Import your GitHub repository.
3. **Configure Project Settings**:
   - **Framework Preset**: `Vite` (Vercel should auto-detect this)
   - **Root Directory**: `frontend` *(Vercel will build from inside the frontend folder)*
4. **Configure Environment Variables**:
   Under the **Environment Variables** section, add the URL of your newly deployed Render backend along with configuration variables:

   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://campusconnect-backend.onrender.com/api` | The live URL of your Render backend ending with `/api` |
   | `VITE_APP_NAME` | `CampusConnect` | Frontend application brand title |
   | `VITE_FIREBASE_API_KEY` | `AIzaSyDyRnySQYBETpRqX-8gNtUYgMWx4wIctH4` | Firebase API Key |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `campus-connect-fec05.firebaseapp.com` | Firebase Auth Domain |
   | `VITE_FIREBASE_PROJECT_ID` | `campus-connect-fec05` | Firebase Project ID |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `campus-connect-fec05.firebasestorage.app` | Firebase Storage Bucket |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `587447441930` | Firebase Messaging Sender ID |
   | `VITE_FIREBASE_APP_ID` | `1:587447441930:web:354c895b3dceba49501df3` | Firebase App ID |
   | `VITE_FIREBASE_MEASUREMENT_ID` | `G-844QDDGZTZ` | Firebase Measurement ID |
   | `VITE_ENABLE_FIREBASE` | `true` | Enable Firebase integrations |
   | `VITE_ENABLE_REAL_TIME_NOTIFICATIONS` | `true` | Enable real-time alerts via Firestore |
   | `VITE_DEBUG_MODE` | `false` | Disable frontend debug logs |

5. **Deploy**:
   - Click **Deploy**. Vercel will build the React bundle and deploy the frontend.
   - Vercel automatically honors the `frontend/vercel.json` rewrite file to ensure React Router client-side routes (like `/login`, `/dashboard`) reload correctly without 404 errors.

---

## 🔄 Step 4: Database Seeding (Production)

If you want to seed the production database with the initial dummy users (Admin, Staff, Student accounts):

1. On your local machine, open `backend/.env`.
2. Temporarily replace the `MONGODB_URI` with your production **MongoDB Atlas connection string**.
3. Run the seeder script locally to populate the remote database:
   ```bash
   cd backend
   npm run seed
   ```
4. Restore `backend/.env` back to your local MongoDB connection string (`mongodb://127.0.0.1:27017/campusconnect`) to prevent accidental remote overwrites.

Your CampusConnect application is now fully deployed and production-ready!
