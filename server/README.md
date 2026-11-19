# Blogger - Server (Backend API)

REST API backend for the Fullstack MERN Blogging Platform, built with **Node.js**, **Express**, **MongoDB (Mongoose)**, **Passport Google OAuth 2.0**, and **AWS S3**.

---

## 🚀 Features

- **Authentication & Security**:
  - Secure password hashing with `bcryptjs`.
  - Stateless JSON Web Token (`jsonwebtoken`) authentication with `verifyJWT` middleware.
  - **Google OAuth 2.0** with automatic state-based redirection for local and production frontends.
  - Dynamic CORS supporting local development and production domains.
- **Blog Management**:
  - Create, publish, draft, edit, and delete blogs.
  - Search blogs by title, tags, and category filters.
  - Pagination and read count analytics.
- **Engagement & Interactions**:
  - Like/unlike system with real-time counters.
  - Nested comment and reply architecture.
- **Notifications**:
  - In-app notification triggers for likes, comments, and replies.
  - Read/unread status management.
- **Cloud Media Uploads**:
  - AWS S3 pre-signed URL generation for direct, secure banner and profile image uploads.
- **Serverless & Production Ready**:
  - Configured for **Vercel Serverless Functions** with automated MongoDB connection pooling and cold-start handling.

---

## 📁 Project Structure

```text
server/
├── Schema/
│   ├── Blog.js             # Mongoose schema for blog posts
│   ├── Comment.js          # Mongoose schema for comments & replies
│   ├── Notification.js     # Mongoose schema for user notifications
│   └── User.js             # Mongoose schema for users & profiles
├── .env.example            # Environment variables template
├── package.json            # Server dependencies and scripts
├── server.js               # Express application, routes, and passport config
└── vercel.json             # Vercel serverless build and routing configuration
```

---

## 🛠️ Getting Started (Local Development)

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB Database** (MongoDB Atlas or local instance)
- **Google Cloud Console Account** (for Google OAuth 2.0)
- **AWS Account** with S3 Bucket (for image uploads)

### 2. Install Dependencies
```bash
cd server
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your `.env` configuration:
```env
# Server Port
PORT=3000

# Frontend URL
ORIGIN_URL=http://localhost:5173

# Google OAuth Callback URL
# Local: http://localhost:3000/auth/google/callback
# Production: https://<your-server-domain>.vercel.app/auth/google/callback
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Database
DATABASE=mongodb+srv://<username>:<password>@cluster.mongodb.net/Blog-Post?retryWrites=true&w=majority

# JWT Access Secret
SECRET_ACCESS_KEY=your_jwt_secret_key

# AWS S3 (for image uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
```

### 4. Run Development Server
```bash
# Starts the server with nodemon auto-reload:
npm run dev
```
The server will start on [http://localhost:3000](http://localhost:3000).

---

## 🔐 Google Cloud Console OAuth Setup

To enable Google OAuth for both Local and Production environments:

1. Open **[Google Cloud Console](https://console.cloud.google.com/)** > **APIs & Services** > **Credentials**.
2. Open your **OAuth 2.0 Client ID**.
3. Add to **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `http://localhost:3000`
   - `https://<your-frontend-domain>.vercel.app`
   - `https://<your-backend-domain>.vercel.app`
4. Add to **Authorized redirect URIs**:
   - `http://localhost:3000/auth/google/callback`
   - `https://<your-backend-domain>.vercel.app/auth/google/callback`
5. Save changes.

---

## 📡 Key API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/signup` | Register new user with email & password | No |
| `POST` | `/signin` | Login user with email & password | No |
| `GET` | `/auth/google` | Initiate Google OAuth 2.0 flow | No |
| `GET` | `/auth/google/callback` | Google OAuth callback handler | No |
| `GET` | `/get-current-user` | Fetch current logged-in user profile | Yes (`Bearer <token>`) |
| `GET` | `/get-upload-url` | Generate AWS S3 pre-signed upload URL | No |
| `POST` | `/create-blog` | Create or update a blog post | Yes (`Bearer <token>`) |
| `POST` | `/latest-blogs` | Fetch latest published blogs | No |
| `POST` | `/trending-blogs` | Fetch trending blogs | No |
| `POST` | `/search-blogs` | Search blogs by query/tag | No |
| `POST` | `/like-blog` | Like or unlike a blog | Yes (`Bearer <token>`) |
| `POST` | `/add-comments` | Add a comment or reply | Yes (`Bearer <token>`) |
| `GET` | `/new-notification` | Check for unread notifications | Yes (`Bearer <token>`) |

---

## ☁️ Deployment on Vercel

1. In [Vercel](https://vercel.com/), click **Add New > Project**.
2. Select your repository (`samrat-satyam-09/Blogger`).
3. Set **Root Directory** to `server` (Click *Edit* and select the `server` folder).
4. **Framework Preset**: `Other`.
5. Add all **Environment Variables** listed above (`DATABASE`, `SECRET_ACCESS_KEY`, `ORIGIN_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
6. Click **Deploy**.
7. Once deployed, copy your backend URL (e.g. `https://blogger-server.vercel.app`) to use in the frontend `VITE_SERVER_DOMAIN`.
