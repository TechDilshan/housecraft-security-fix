# Setup Guide

## 1. Prerequisites
- Node.js 18+
- MongoDB running locally or remote URI

## 2. Configure .env
Copy `env.template` to `.env` and fill required values. See `SECURITY_SETUP.md`.

## 3. Install Dependencies
```bash
npm install
```

## 4. Run App
```bash
npm run dev
```

## 5. Security Checklist
- CSP enabled with explicit fallbacks
- X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Rate limiting enabled (`general`, `auth`, `register`, `password`, `consultation`)
- CSRF protection wired; frontend Axios set to use `XSRF-TOKEN`
- JWT in httpOnly cookie only; `withCredentials: true`
- Input validation via Joi; XSS sanitization in middleware
- User-Agent validation and throttling
- CORS restricted to `ALLOWED_ORIGINS`

