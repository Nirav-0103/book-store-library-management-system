# 📚 Luxe Library — Full MERN Stack Application

A premium, luxury-designed Library Management System built with MongoDB, Express.js, React, and Node.js.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🏠 Homepage | Animated hero slider (3 slides), stats bar, category grid, about section, testimonials, CTA banner |
| 🔐 Authentication | JWT-based login & signup with role-based access |
| 👤 User Dashboard | Browse catalog, update profile, change password |
| 🛡️ Admin Panel | Collapsible sidebar, full management interface |
| 👥 User Management | Create, edit, delete, activate/deactivate users |
| 📚 Books | Full CRUD with search & category filter |
| 🪪 Members | Register, edit, toggle status, delete |
| 🔄 Issues | Issue books, return books, fine calculation (₹5/day) |
| 📊 Dashboard | Live stats, recent issues, category breakdown |
| 🎨 Design | Luxury dark theme, gold accents, smooth animations |

---

## 🗂️ Project Structure

```
library-full/
├── server/                        ← Node.js + Express Backend
│   ├── index.js                   ← Server entry point (auto-creates admin)
│   ├── .env                       ← Environment variables
│   ├── middleware/
│   │   └── auth.js                ← JWT protect, adminOnly, staffOnly
│   ├── models/
│   │   ├── User.js                ← User + roles + auto membershipId
│   │   ├── Book.js                ← Book schema
│   │   ├── Member.js              ← Member schema
│   │   └── Issue.js               ← Issue/Return schema
│   └── routes/
│       ├── auth.js                ← Login, Register, Profile, Change Password
│       ├── users.js               ← Admin user management
│       ├── books.js               ← Books CRUD
│       ├── members.js             ← Members CRUD
│       ├── issues.js              ← Issue & Return APIs
│       └── dashboard.js           ← Stats API
│
└── client/                        ← React Frontend
    ├── public/index.html
    └── src/
        ├── index.js
        ├── index.css              ← Global luxury CSS variables
        ├── App.js                 ← Router + Protected Routes
        ├── api.js                 ← Axios API calls
        ├── context/
        │   └── AuthContext.js     ← Global auth state
        ├── components/layout/
        │   ├── Header.js + .css   ← Transparent → solid on scroll
        │   └── Footer.js + .css   ← 4-column footer
        └── pages/
            ├── HomePage.js + .css ← Hero slider, stats, categories, about
            ├── auth/
            │   ├── LoginPage.js   ← Split-panel luxury login
            │   ├── SignupPage.js  ← Registration with password strength
            │   └── Auth.css
            ├── user/
            │   ├── UserDashboard.js  ← Catalog, Profile, Security tabs
            │   └── UserDashboard.css
            └── admin/
                ├── AdminPanel.js     ← Collapsible sidebar layout
                ├── AdminPanel.css    ← All shared admin styles
                ├── DashboardHome.js  ← Stats cards + recent issues
                ├── BooksPage.js      ← Books CRUD
                ├── MembersPage.js    ← Members CRUD
                ├── IssuesPage.js     ← Issue/Return management
                └── UsersPage.js      ← User management (admin only)
```

---

## ⚙️ Prerequisites

- **Node.js** v16 or higher → https://nodejs.org
- **MongoDB** installed and running locally → https://www.mongodb.com/try/download/community

---

## 🚀 Setup & Run (Step by Step)

### Step 1 — Extract ZIP
Extract `library-full-mern.zip` to any folder.

### Step 2 — Start MongoDB
```bash
mongod
```

### Step 3 — Setup & Start Backend
```bash
cd library-full/server
npm install
npm run dev
```
✅ Server: http://localhost:5000

> On first run, a default **admin account** is auto-created:
> - Email: `admin@library.com`
> - Password: `admin123`

### Step 4 — Setup & Start Frontend
Open a **new terminal**:
```bash
cd library-full/client
npm install
npm start
```
✅ App: http://localhost:3000

---

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@library.com | admin123 |
| Member | Register via /signup | your choice |

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/change-password | Change password |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | Get all users |
| POST | /api/users | Create user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |
| PUT | /api/users/:id/toggle | Toggle active status |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/books | Get all books (public) |
| POST | /api/books | Add book (staff) |
| PUT | /api/books/:id | Update book (staff) |
| DELETE | /api/books/:id | Delete book (staff) |

### Members, Issues, Dashboard
Similar CRUD routes protected by JWT.

---

## 🌐 Environment Variables

Edit `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/library_luxury_db
PORT=5000
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
```

---

## 🎨 Design System

- **Font**: Cormorant Garamond (headings) + Jost (body)
- **Colors**: Deep black backgrounds, gold (`#c9a84c`) accents
- **Theme**: Luxury dark — editorial, refined, premium
- **Animations**: Hero particle system, floating elements, slide transitions, CSS micro-interactions

---

Built with ❤️ — MERN Stack Full Application
