
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/authRoutes.js';
import houseRoutes from './routes/houseRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { User } from './models/User.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if(!origin) return callback(null, true);
      
      // Allow all origins for now (you can restrict this in production)
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// CORS configuration for express
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if(!origin) return callback(null, true);
    
    // Allow all origins for now (you can restrict this in production)
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request body
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/users', userRoutes);

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log('Socket auth error: No token provided');
      return next(new Error('Authentication error: Token not provided'));
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded.userId) {
        console.log('Socket auth error: Invalid token structure');
        return next(new Error('Authentication error: Invalid token structure'));
      }
      
      // Find user by ID
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        console.log('Socket auth error: User not found');
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user to socket
      socket.user = user;
      console.log(`Socket authenticated for user: ${user._id}`);
      next();
    } catch (error) {
      console.log('Socket auth error:', error.message);
      return next(new Error('Authentication error: ' + error.message));
    }
  } catch (error) {
    console.error('Unexpected error in socket auth:', error);
    next(new Error('Authentication error: ' + error.message));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.user._id);
  
  // Join consultation chat rooms
  socket.on('join-chat', (consultationId) => {
    socket.join(consultationId);
    console.log(`User ${socket.user._id} joined chat ${consultationId}`);
  });
  
  // Leave consultation chat rooms
  socket.on('leave-chat', (consultationId) => {
    socket.leave(consultationId);
    console.log(`User ${socket.user._id} left chat ${consultationId}`);
  });
  
  // Handle new messages
  socket.on('send-message', async (data) => {
    try {
      const { consultationId, content, recipientId } = data;
      const senderId = socket.user._id;
      
      // Import here to avoid circular dependency
      const { ConsultationRequest } = await import('./models/ConsultationRequest.js');
      
      const consultation = await ConsultationRequest.findById(consultationId);
      if (!consultation) {
        console.log(`Consultation not found: ${consultationId}`);
        socket.emit('error', { message: 'Consultation not found' });
        return;
      }

      // Check if user is authorized to add messages
      if (
        consultation.userId.toString() !== senderId.toString() && 
        consultation.professionalId.toString() !== senderId.toString()
      ) {
        console.log(`User ${senderId} not authorized for consultation ${consultationId}`);
        socket.emit('error', { message: 'Not authorized to add messages to this consultation' });
        return;
      }
      
      // Create and add message
      const newMessage = {
        senderId,
        recipientId,
        content,
        timestamp: Date.now()
      };
      
      consultation.messages.push(newMessage);
      consultation.updatedAt = Date.now();
      await consultation.save();
      
      console.log(`Message sent in room ${consultationId}`);
      
      // Broadcast the message to the room
      io.to(consultationId).emit('new-message', {
        ...newMessage,
        consultationId // Include the consultationId in the emitted message
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Error sending message: ' + error.message });
    }
  });
  
  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user._id);
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Start server with Socket.IO
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
