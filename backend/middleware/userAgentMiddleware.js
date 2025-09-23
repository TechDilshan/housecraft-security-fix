// User-Agent validation middleware to prevent User-Agent fuzzing attacks

// List of suspicious User-Agent patterns
const suspiciousPatterns = [
  /<script/i,
  /javascript:/i,
  /vbscript:/i,
  /onload=/i,
  /onerror=/i,
  /onclick=/i,
  /onmouseover=/i,
  /alert\(/i,
  /document\.cookie/i,
  /document\.write/i,
  /eval\(/i,
  /expression\(/i,
  /import\s+/i,
  /union\s+select/i,
  /drop\s+table/i,
  /insert\s+into/i,
  /delete\s+from/i,
  /update\s+set/i,
  /exec\s*\(/i,
  /system\s*\(/i,
  /cmd\s*\(/i,
  /shell\s*\(/i,
  /\.\.\//i,  // Directory traversal
  /\.\.\\/i,  // Directory traversal (Windows)
  /null/i,
  /undefined/i,
  /%00/i,     // Null byte
  /%0a/i,     // Line feed
  /%0d/i,     // Carriage return
  /%22/i,     // Double quote
  /%27/i,     // Single quote
  /%3c/i,     // Less than
  /%3e/i,     // Greater than
];

// Maximum length for User-Agent header (typical modern UAs can be long)
const MAX_USER_AGENT_LENGTH = 1024;

// Common benign User-Agent patterns to reduce false positives
const benignUserAgents = [
  /Mozilla\/5\.0/i,
  /AppleWebKit\//i,
  /Chrome\//i,
  /Safari\//i,
  /Firefox\//i,
  /Edg\//i,
  /OPR\//i
];

const isSuspiciousUA = (ua) => {
  if (!ua) return false;
  // If UA matches any benign pattern, treat as non-suspicious
  if (benignUserAgents.some((re) => re.test(ua))) {
    return false;
  }
  // Check for dangerous patterns
  return dangerousPatterns.some((re) => re.test(ua));
};

export const validateUserAgent = (req, res, next) => {
  const userAgent = req.get('User-Agent');
  
  // If no User-Agent, set a default one
  if (!userAgent) {
    req.headers['user-agent'] = 'HouseCraft-Secure-Client/1.0';
    return next();
  }
  
  // Check length (only warn; don't block unless extreme)
  if (userAgent.length > MAX_USER_AGENT_LENGTH) {
    console.warn(`User-Agent length exceeds ${MAX_USER_AGENT_LENGTH} characters (allowing, will monitor)`);
  }

  // Check for suspicious patterns (now using helper)
  if (isSuspiciousUA(userAgent)) {
    console.warn(`Suspicious User-Agent detected from ${req.ip}: ${userAgent.substring(0, 120)}...`);
    return res.status(400).json({
      message: 'Invalid request headers',
      error: 'Suspicious User-Agent detected'
    });
  }
  
  next();
};

// Rate limiting specifically for User-Agent fuzzing attempts
export const userAgentRateLimit = (req, res, next) => {
  const userAgent = req.get('User-Agent');
  const clientIP = req.ip;
  
  // Simple in-memory tracking (in production, use Redis or similar)
  if (!global.userAgentAttempts) {
    global.userAgentAttempts = new Map();
  }
  
  const key = `${clientIP}-${userAgent}`;
  const now = Date.now();
  const attempts = global.userAgentAttempts.get(key) || [];
  
  // Remove attempts older than 15 minutes
  const recentAttempts = attempts.filter(timestamp => now - timestamp < 15 * 60 * 1000);
  
  // Only count attempts when UA is actually suspicious
  if (isSuspiciousUA(userAgent)) {
    if (recentAttempts.length >= 5) {
      console.warn(`User-Agent fuzzing detected from IP: ${clientIP}`);
      return res.status(429).json({ 
        message: 'Too many suspicious requests',
        error: 'Rate limit exceeded'
      });
    }
    recentAttempts.push(now);
    global.userAgentAttempts.set(key, recentAttempts);
  }
  
  next();
};
