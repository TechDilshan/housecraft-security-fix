# Security Setup

## Environment Variables (.env)
- Backend
  - `PORT=5001`
  - `NODE_ENV=development`
  - `JWT_SECRET=your-long-random-secret`
  - `MONGODB_URI=mongodb://localhost:27017/housecraft`
  - `ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173`
- Frontend
  - `VITE_API_URL=http://localhost:5001/api`
  - `VITE_FIREBASE_*` (API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID)

## Install
```bash
npm install
```

## Start
```bash
npm run dev
```

## Notes
- Cookies use `SameSite` lax in dev, strict in prod; `secure` only in prod.
- CSRF token available at `/api/auth/csrf-token`.

