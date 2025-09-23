# User-Agent Fuzzer – Fix Summary

## Problem
ZAP observed responses to malformed/suspicious User-Agent values.

## Fix
- Added `backend/middleware/userAgentMiddleware.js`:
  - Suspicious pattern detection (XSS/SQLi/traversal encodings)
  - Length limit and sanitization
  - Per-IP rate limiting for fuzzing attempts
- Registered middleware in `backend/server.js` before routes.

## Test
```bash
curl -H "User-Agent: <script>alert(1)</script>" http://localhost:5001/api/auth/login
# 400 Invalid request headers
```

## Files
- `backend/middleware/userAgentMiddleware.js`
- `backend/server.js`

