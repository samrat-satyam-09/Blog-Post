# Blogger - Client (Frontend)

Frontend for the Fullstack MERN Blogging Platform, built with **React**, **Vite**, **Tailwind CSS**, and **Editor.js**.

---

## 🚀 Features

- **Modern Authentication**:
  - Email & Password sign-up and sign-in.
  - **Google OAuth 2.0** one-click authentication.
  - Session persistence and protected routes.
- **Rich Text Blog Editor**:
  - Powered by **Editor.js** (headers, lists, images, code blocks, quotes).
  - Draft saving and publishing workflows with custom tags and descriptions.
- **Interactive Feed & Reading**:
  - Trending blogs and category-filtered feeds.
  - Like interactions and nested comment replies.
- **User Dashboard & Analytics**:
  - Notification center with real-time read/unread status.
  - Manage published blogs, drafts, and read counts.
  - Profile customization (bio, avatar, social media links).
  - Account security (change password).
- **Responsive & Animated Design**:
  - Fully responsive for mobile, tablet, and desktop screens.
  - Page transition animations powered by Framer Motion.

---

## 📁 Project Structure

```text
client/
├── public/                 # Static public assets
├── src/
│   ├── assets/             # Icons, logos, and images
│   ├── common/             # Helper utilities
│   │   ├── aws.jsx         # S3 image upload helper
│   │   ├── date.jsx        # Date formatting helpers
│   │   ├── page-animation.jsx # Framer Motion wrapper
│   │   └── session.jsx     # Session storage management
│   ├── components/         # Reusable UI components
│   │   ├── blog-editor.component.jsx
│   │   ├── blog-post.component.jsx
│   │   ├── comments.component.jsx
│   │   ├── input.component.jsx
│   │   ├── navbar.component.jsx
│   │   ├── notification-card.component.jsx
│   │   ├── publish-form.component.jsx
│   │   └── sidenavbar.component.jsx
│   ├── pages/              # Route pages
│   │   ├── 404.page.jsx
│   │   ├── AuthSuccess.jsx # Google OAuth callback handler
│   │   ├── blog.page.jsx   # Blog reading view
│   │   ├── editor.pages.jsx# Editor view
│   │   ├── home.page.jsx   # Feed & trending
│   │   ├── manage-blogs.page.jsx
│   │   ├── notifications.page.jsx
│   │   ├── profile.page.jsx
│   │   ├── search.page.jsx
│   │   └── userAuthForm.page.jsx
│   ├── App.jsx             # Main routing and UserContext provider
│   ├── index.css           # Global Tailwind and font styles
│   └── main.jsx            # React root mount
├── .env.example            # Environment variables template
├── package.json            # Client dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── vercel.json             # Vercel SPA routing rewrites
└── vite.config.js          # Vite configuration
```

---

## 🛠️ Getting Started (Local Development)

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### 2. Install Dependencies
```bash
cd client
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your backend server URL:
```env
# Local Backend URL
VITE_SERVER_DOMAIN=http://localhost:3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```
The production bundle will be output to the `dist/` folder.

---

## ☁️ Deployment on Vercel

1. Log in to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Select your repository (`samrat-satyam-09/Blogger`).
3. Set **Root Directory** to `client` (Click *Edit* next to Root Directory and select the `client` folder).
4. **Framework Preset**: `Vite` (Auto-detected).
5. Add **Environment Variables**:
   - `VITE_SERVER_DOMAIN` = `https://<your-backend-domain>.vercel.app`
6. Click **Deploy**.

> **Note**: `vercel.json` is already included to ensure React Router client-side routes (e.g. `/sign-in`, `/auth-success`, `/editor`) do not return 404 on page refresh.
