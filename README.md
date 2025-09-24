## HouseCraft Hub — Secure Edition

### Team
- **Member 1**: IT22118318 — Dilshan S.C
- **Member 2**: IT22569868 — Madusarani K.G.L
- **Member 3**: IT22120502 — Liyanaarachchi L.A.V.U
- **Member 4**: IT22341204 — K. Rangana Malmi Nadee

### Links
- **Original Project Repository**: [DYNAC-Dev/housecraft-hub-67](https://github.com/DYNAC-Dev/housecraft-hub-67.git)
- **This Security-Fixed Repository**: [TechDilshan/housecraft-security-fix](https://github.com/TechDilshan/housecraft-security-fix.git)
- **Demo Video**: [YouTube Walkthrough](https://www.youtube.com/watch?v=QcgYG1kvsrI)

### Overview
HouseCraft Hub is a full‑stack web application for browsing house listings, managing property requests, and enabling consultations with professionals via real‑time chat. This edition focuses on remediating critical security issues (authentication, CSRF, XSS, CORS, headers, rate‑limiting) while preserving core functionality.

- **Frontend**: Vite + React + TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Realtime**: Socket.IO
- **Auth**: JWT (httpOnly cookies), Google OAuth (via `google-auth-library`)


---

## Getting Started

### 1) Prerequisites
- Node.js 18+ and npm
- MongoDB running locally or a connection string (MongoDB Atlas)

### 2) Clone
```bash
git clone https://github.com/TechDilshan/housecraft-security-fix.git
cd housecraft-security-fix
```

### 3) Install dependencies
```bash
npm install
```

### 4) Environment variables
Create two files from the provided templates:

- Backend: `backend/.env`
- Frontend: `.env`


Backend (`backend/.env`):
```
PORT=5001
NODE_ENV=development
JWT_SECRET=your-long-random-secret
MONGODB_URI=mongodb://localhost:27017/housecraft
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

Frontend (`.env`):
```
VITE_API_URL=http://localhost:5001/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 5) Run (Dev)
In one terminal, start the backend:
```bash
node backend/server.js
```

In another terminal, start the frontend:
```bash
npm run dev
```
Then open the printed local URL (typically `http://localhost:5001`).

Notes:
- Cookies are `SameSite=Lax` in development, `SameSite=Strict` and `secure` in production.
- CSRF token endpoint: `GET /api/auth/csrf-token` — automatically read by Axios when configured.
- WebSocket origin/CORS is restricted; ensure your frontend dev URL is listed in `ALLOWED_ORIGINS`.

---

## Scripts
- `npm run dev` — Start Vite dev server for the frontend
- `npm run build` — Build frontend for production
- `npm run preview` — Preview the production build
- `npm run lint` — Run ESLint

(Backend is started with `node backend/server.js`. You can add a PM2 or nodemon script if desired.)

---

## Security Highlights
- **JWT in httpOnly cookies**: Prevents XSS token theft
- **CSRF protection**: Double‑submit cookie via `csurf` and `/api/auth/csrf-token`
- **Input validation**: Joi validators on critical routes
- **XSS protection**: DOMPurify sanitization and strict CSP
- **Rate limiting**: Separate limiters for auth, register, password, consultations
- **Hardened headers**: `helmet`, `X-Frame-Options=DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS
- **CORS**: Explicit allowed origins for REST and Socket.IO

For full details, see `SECURITY_FIXES_SUMMARY.md`, `XSS_PROTECTION_FIX.md`, and `USER_AGENT_FUZZER_FIX.md`.

---

### Identified Vulnerabilities (Fixed)
- **CSP Failure to Define Directive with No Fallback**
- **Information Disclosure**
- **Missing Rate Limiting in Auth**
- **Authentication Request Identified (CSRF)**
- **Missing Input Validation in property**
- **Exposed Firebase Configuration in Firebase config**
- **User Controllable HTML Element Attribute (Potential XSS)**
- **Insecure Token Storage in Authentication context**
- **Missing Anti-Clickjacking Protection in server configuration**
- **User Agent Fuzzer**
- **Overly Permissive CORS in server configuration**
- **Weak Password Policy in User**

---

## Project Structure
```
backend/                # Express server, routes, middleware, models
src/                    # React app (Vite)
  components/           # UI components
  context/              # Providers (Auth, Socket)
  pages/                # App pages and routes
  services/             # API client and services
  config/               # Firebase config
```

---

## Troubleshooting
- **CORS errors**: Add your frontend origin to `ALLOWED_ORIGINS` in `backend/.env`.
- **MongoDB connection**: Verify `MONGODB_URI` and that MongoDB is running.
- **CSRF token missing/invalid**: Ensure you call `/api/auth/csrf-token` (handled automatically by the app on load) and that cookies are enabled.
- **Login issues**: Clear cookies, ensure `JWT_SECRET` is set, and check server logs.

---

## Credits
- Based on the original HouseCraft Hub by the DYNAC team. This edition implements defense‑in‑depth security fixes while keeping user experience consistent.
