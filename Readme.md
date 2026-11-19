# Blogger - Fullstack MERN Blogging Platform

A modern, responsive fullstack blogging platform built with the **MERN** stack (**MongoDB**, **Express**, **React**, **Node.js**), **Vite**, **Tailwind CSS**, and **Google OAuth 2.0**.

---

## 📸 Highlights & Features

- **Google OAuth 2.0 & JWT Authentication**: Sign in with Google or standard email/password across local and production.
- **Rich Text Editor**: Integrated with **Editor.js** for headers, lists, code blocks, and images.
- **Media Storage**: AWS S3 pre-signed URL uploads for blog banners and profile pictures.
- **Interactions**: Like system, nested comments, and replies.
- **Notification Engine**: In-app notifications for likes, comments, and replies.
- **Personal Dashboard**: Manage published posts, drafts, view read statistics, edit profile, and change password.
- **Vercel Serverless Ready**: Configured for independent deployment of client and server on Vercel.

---

## 📁 Repository Structure

```text
Blogger/
├── client/                 # Frontend React + Vite application
│   ├── src/                # Components, pages, common utils
│   ├── .env.example        # Frontend environment variables template
│   ├── README.md           # Detailed frontend documentation
│   └── vercel.json         # Vercel SPA routing rewrites
│
├── server/                 # Backend Node.js + Express REST API
│   ├── Schema/             # Mongoose schemas (User, Blog, Comment, Notification)
│   ├── server.js           # API routes, middleware & Google OAuth
│   ├── .env.example        # Backend environment variables template
│   ├── README.md           # Detailed backend documentation
│   └── vercel.json         # Vercel serverless functions configuration
│
└── .gitignore              # Monorepo-wide gitignore (secrets, node_modules, keys)
```

---

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/samrat-satyam-09/Blogger.git
cd Blogger
```

### 2. Setup Server
```bash
cd server
npm install
cp .env.example .env
# Fill in your MongoDB connection, JWT Secret, Google OAuth and AWS keys in .env
npm run dev
```
The server will run on [http://localhost:3000](http://localhost:3000).

### 3. Setup Client
```bash
cd ../client
npm install
cp .env.example .env
# Set VITE_SERVER_DOMAIN=http://localhost:3000 in .env
npm run dev
```
The client will run on [http://localhost:5173](http://localhost:5173).

---

## 🚀 Deployment Guide (Vercel)

For detailed deployment steps on Vercel, refer to:
- [Client Deployment Guide](client/README.md#️-deployment-on-vercel)
- [Server Deployment Guide](server/README.md#️-deployment-on-vercel)
