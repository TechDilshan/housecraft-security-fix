// XSS Protection Middleware to prevent User Controllable HTML Element Attribute attacks

import DOMPurify from 'isomorphic-dompurify';

// Dangerous HTML attributes that should be sanitized
const dangerousAttributes = [
  'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur',
  'onchange', 'onsubmit', 'onreset', 'onselect', 'onkeydown', 'onkeyup', 'onkeypress',
  'onmousedown', 'onmouseup', 'onmousemove', 'onmouseenter', 'onmouseleave',
  'ondblclick', 'oncontextmenu', 'onwheel', 'ontouchstart', 'ontouchend', 'ontouchmove',
  'onabort', 'oncanplay', 'oncanplaythrough', 'ondurationchange', 'onemptied',
  'onended', 'onerror', 'onloadeddata', 'onloadedmetadata', 'onloadstart',
  'onpause', 'onplay', 'onplaying', 'onprogress', 'onratechange', 'onseeked',
  'onseeking', 'onstalled', 'onsuspend', 'ontimeupdate', 'onvolumechange', 'onwaiting'
];

// Dangerous HTML tags that should be removed
const dangerousTags = [
  'script', 'iframe', 'object', 'embed', 'applet', 'form', 'input', 'textarea',
  'select', 'button', 'link', 'meta', 'style', 'base', 'frame', 'frameset'
];

// Sanitize HTML content to prevent XSS
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Use DOMPurify to sanitize HTML
  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['class', 'id'],
    FORBID_TAGS: dangerousTags,
    FORBID_ATTR: dangerousAttributes,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false
  });

  return cleanHtml;
};

// Sanitize text content (remove all HTML)
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove all HTML tags and decode entities
  const cleanText = text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#x60;/g, '`')
    .replace(/&#x3D;/g, '=')
    .trim();

  return cleanText;
};

// Sanitize URL to prevent javascript: and data: protocols
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const cleanUrl = url.trim();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
  const lowerUrl = cleanUrl.toLowerCase();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '';
    }
  }

  // Only allow http, https, and mailto protocols
  if (!lowerUrl.match(/^(https?:\/\/|mailto:|tel:|#)/)) {
    return '';
  }

  return cleanUrl;
};

// Sanitize object recursively
export const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize the key as well
      const cleanKey = sanitizeText(key);
      sanitized[cleanKey] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};

// XSS Protection middleware
export const xssProtection = (req, res, next) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  // Sanitize headers that might contain user input
  const headersToSanitize = ['referer', 'origin', 'user-agent'];
  headersToSanitize.forEach(header => {
    if (req.headers[header]) {
      req.headers[header] = sanitizeText(req.headers[header]);
    }
  });

  next();
};

// Specific middleware for HTML content fields
export const sanitizeHtmlFields = (fields) => {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      fields.forEach(field => {
        if (req.body[field]) {
          req.body[field] = sanitizeHtml(req.body[field]);
        }
      });
    }
    next();
  };
};

// Specific middleware for URL fields
export const sanitizeUrlFields = (fields) => {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      fields.forEach(field => {
        if (req.body[field]) {
          req.body[field] = sanitizeUrl(req.body[field]);
        }
      });
    }
    next();
  };
};

// Rate limiting for XSS attempts
export const xssRateLimit = (req, res, next) => {
  const clientIP = req.ip;
  
  if (!global.xssAttempts) {
    global.xssAttempts = new Map();
  }
  
  const now = Date.now();
  const attempts = global.xssAttempts.get(clientIP) || [];
  
  // Remove attempts older than 10 minutes
  const recentAttempts = attempts.filter(timestamp => now - timestamp < 10 * 60 * 1000);
  
  // If more than 3 XSS attempts in 10 minutes, block
  if (recentAttempts.length >= 3) {
    console.warn(`XSS attack attempt detected from IP: ${clientIP}`);
    return res.status(429).json({ 
      message: 'Too many suspicious requests',
      error: 'Rate limit exceeded'
    });
  }
  
  // Check for XSS patterns in request
  const requestString = JSON.stringify(req.body) + JSON.stringify(req.query) + JSON.stringify(req.params);
  const xssPatterns = [
    /<script/i, /javascript:/i, /on\w+\s*=/i, /alert\s*\(/i, /document\./i,
    /eval\s*\(/i, /expression\s*\(/i, /vbscript:/i, /data:text\/html/i
  ];
  
  const hasXssPattern = xssPatterns.some(pattern => pattern.test(requestString));
  
  if (hasXssPattern) {
    recentAttempts.push(now);
    global.xssAttempts.set(clientIP, recentAttempts);
    console.warn(`Potential XSS attempt from IP: ${clientIP}`);
  }
  
  next();
};
