# ⭐ KidPoints — Node.js + SQLite + Mobile-Responsive React

## Quick Start

### Requirements
- Node.js 16+  →  https://nodejs.org
- npm 8+

### 1. Install all dependencies
```bash
npm run install:all
```

### 2. Start both server + client
```bash
npm install          # installs concurrently
npm run dev
```

**Or two terminals:**
```bash
# Terminal 1
npm run start:server   # → http://localhost:5000

# Terminal 2
npm run start:client   # → http://localhost:3000
```

Open **http://localhost:3000**  
Demo login: `demo@kidpoints.com` / `demo1234`

---

## Stack
| Layer | Tech |
|-------|------|
| Backend | Node.js 18, Express 4 |
| Database | SQLite via `better-sqlite3` |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Frontend | React 18, React Router 6 |
| HTTP Client | Axios |
| Toasts | react-hot-toast |
| Styling | Pure CSS — mobile-first |

## Mobile Features
- Bottom nav bar on phones
- Sheet-style modals (slide up from bottom)
- 2-column kid grid on phone → 4 on desktop
- Touch-friendly button sizes
- Safe-area insets for notched phones

## Database
SQLite file: `server/kidpoints.db` (auto-created on first run)

Reset: delete `server/kidpoints.db` and restart the server.

## API
All routes require `Authorization: Bearer <token>` except auth.

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/kids | List kids |
| POST | /api/kids | Add kid |
| GET/PUT/DELETE | /api/kids/:id | Kid CRUD |
| POST | /api/kids/:id/health | Add health record |
| GET | /api/kids/:id/health | Health history |
| GET | /api/activities | List activities |
| POST | /api/activities | Add activity |
| DELETE | /api/activities/:id | Delete activity |
| GET | /api/history | History |
| POST | /api/history/assign | Assign points |
| POST | /api/history/manual | Manual adjust |
| DELETE | /api/history/:id | Undo entry |
| GET/PUT | /api/profile | Parent profile |

## JWT Secret
```bash
JWT_SECRET=my_secure_secret npm run dev
```
