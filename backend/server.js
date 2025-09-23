// Import required modules and dependencies
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/authRoutes.js';
import houseRoutes from './routes/houseRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { User } from './models/User.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { validateUserAgent, userAgentRateLimit } from './middleware/userAgentMiddleware.js';
import { xssProtection, xssRateLimit } from './middleware/xssProtectionMiddleware.js';
import csurf from 'csurf';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Set up security headers using helmet
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          // Baseline fallback
          defaultSrc: ["'self'"],

          // Script and styles
          scriptSrc: ["'self'"],
          // Allow inline styles only in development; avoid in production
          styleSrc: process.env.NODE_ENV === 'production'
            ? ["'self'", "https://fonts.googleapis.com"]
            : ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],

          // Media and connections
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: ["'self'", "ws:", "wss:"],
          mediaSrc: ["'self'"],

          // Frame/embedding controls
          frameAncestors: ["'none'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],

          // Add directives that otherwise have no fallback
          childSrc: ["'none'"],
          workerSrc: ["'self'"],
          manifestSrc: ["'self'"],
          prefetchSrc: ["'self'"],

          // Upgrade mixed content in supported browsers
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false, // Disable for development
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

// Add additional custom security headers
app.use((req, res, next) => {
  // Remove X-Powered-By header for security
  res.removeHeader('X-Powered-By');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Set strict referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Restrict permissions for geolocation, microphone, and camera
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Additional security headers to prevent User-Agent based attacks
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  next();
});

// Create HTTP server for Express app
const httpServer = createServer(app);

// Create Socket.IO server and configure CORS for WebSocket connections
const io = new Server(httpServer, {
  cors: {
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests) in development
      if (!origin && process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      // Check if origin is allowed
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Reject origin if not allowed
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

// Add production origins from environment variables if provided
if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
}

// Configure CORS for Express app
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests) in development
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Reject origin if not allowed
    return callback(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Parse JSON request bodies
app.use(express.json());
// Parse cookies
app.use(cookieParser());

// Apply general rate limiting middleware
app.use(generalLimiter);

// Apply User-Agent validation and fuzzing protection
app.use(userAgentRateLimit);

// Apply User-Agent validation middleware to protect against User-Agent fuzzing attacks
app.use(validateUserAgent);

// Apply XSS protection middleware
app.use(xssRateLimit);
app.use(xssProtection);

// CSRF protection
const csrfProtection = csurf({
  cookie: {
    httpOnly: true, // secret cookie is httpOnly
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
});

// Mount CSRF protection before routes
app.use(csrfProtection);

// Endpoint to provide CSRF token via readable cookie for Axios XSRF support
app.get('/api/auth/csrf-token', (req, res) => {
  const token = req.csrfToken();
  // Expose token in a non-httpOnly cookie that Axios reads (XSRF-TOKEN)
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res.status(200).json({ success: true });
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/users', userRoutes);

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    let token;
    
    // Check for token in cookies first
    if (socket.handshake.headers.cookie) {
      const cookies = socket.handshake.headers.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
      if (tokenCookie) {
        token = tokenCookie.split('=')[1];
      }
    }
    
    // Fallback to auth token for backward compatibility (e.g., from client auth object)
    if (!token && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    }
    
    // If no token is found, reject the connection
    if (!token) {
      console.log('Socket auth error: No token provided');
      return next(new Error('Authentication error: Token not provided'));
    }
    
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check for userId in decoded token
      if (!decoded.userId) {
        console.log('Socket auth error: Invalid token structure');
        return next(new Error('Authentication error: Invalid token structure'));
      }
      
      // Find user by ID and exclude password field
      const user = await User.findById(decoded.userId).select('-password');
      
      // If user not found, reject the connection
      if (!user) {
        console.log('Socket auth error: User not found');
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user object to socket for later use
      socket.user = user;
      console.log(`Socket authenticated for user: ${user._id}`);
      next();
    } catch (error) {
      // Handle JWT verification errors
      console.log('Socket auth error:', error.message);
      return next(new Error('Authentication error: ' + error.message));
    }
  } catch (error) {
    // Handle unexpected errors in authentication middleware
    console.error('Unexpected error in socket auth:', error);
    next(new Error('Authentication error: ' + error.message));
  }
});

// Handle Socket.IO connections and events
io.on('connection', (socket) => {
  // Log when a user connects via WebSocket
  console.log('User connected:', socket.user._id);
  
  // Handle user joining a chat room (consultation)
  socket.on('join-chat', (consultationId) => {
    socket.join(consultationId);
    console.log(`User ${socket.user._id} joined chat ${consultationId}`);
  });
  
  // Handle user leaving a chat room (consultation)
  socket.on('leave-chat', (consultationId) => {
    socket.leave(consultationId);
    console.log(`User ${socket.user._id} left chat ${consultationId}`);
  });
  
  // Handle sending a message in a consultation chat
  socket.on('send-message', async (data) => {
    try {
      const { consultationId, content, recipientId } = data;
      const senderId = socket.user._id;
      
      // Dynamically import ConsultationRequest model to avoid circular dependencies
      const { ConsultationRequest } = await import('./models/ConsultationRequest.js');
      
      // Find the consultation by ID
      const consultation = await ConsultationRequest.findById(consultationId);
      if (!consultation) {
        socket.emit('error', { message: 'Consultation not found' });
        return;
      }

      // Check if the sender is authorized (either the user or the professional)
      if (
        consultation.userId.toString() !== senderId.toString() && 
        consultation.professionalId.toString() !== senderId.toString()
      ) {
        socket.emit('error', { message: 'Not authorized for this consultation' });
        return;
      }
      
      // Create new message object
      const newMessage = {
        senderId,
        recipientId,
        content,
        timestamp: Date.now(),
        consultationId
      };
      
      // Add the new message to the consultation's messages array
      consultation.messages.push(newMessage);
      consultation.updatedAt = Date.now();
      await consultation.save();
      
      // Emit the new message to all users in the consultation room
      io.to(consultationId).emit('new-message', newMessage);
      
      console.log(`Message sent in consultation ${consultationId}`);
    } catch (error) {
      // Handle errors when sending a message
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Error sending message: ' + error.message });
    }
  });
  
  // Handle user disconnecting from Socket.IO
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user._id);
  });
});

// Error handling middleware (must be after all routes)
app.use(errorHandler);

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Start the HTTP server (with Socket.IO attached)
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
