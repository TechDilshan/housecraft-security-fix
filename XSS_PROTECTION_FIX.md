# User Controllable HTML Element Attribute (XSS) – Fix Summary

## Problem
ZAP reported user-controlled HTML attributes leading to potential XSS.

## Fix
- Added `backend/middleware/xssProtectionMiddleware.js`:
  - HTML sanitization with DOMPurify (allowlist tags/attrs)
  - Text and URL sanitization (blocks `javascript:`/`data:`)
  - Recursive object sanitization for body/query/params
  - XSS pattern detection and rate limiting
- Tightened CSP in `backend/server.js`.
- Applied sanitization in controllers (e.g., `authController.register`).

## How it works
- Middleware sanitizes `req.body`, `req.query`, `req.params` before handlers.
- Specific fields can be sanitized as HTML or URL where needed.

## Test
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"<script>alert(1)</script>","email":"t@e.com","phoneNumber":"123","password":"Password123!"}'
# The script tag is removed; request succeeds with sanitized data
```

## Files
- `backend/middleware/xssProtectionMiddleware.js`
- `backend/server.js`
- `backend/controllers/authController.js`

