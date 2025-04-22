
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Verify JWT token
export const verifyToken = (token) => {
  try {
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

// Protect routes
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, return unauthorized
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    try {
      // Using verify directly instead of the helper method to get more specific errors
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token contains userId (our payload structure)
      if (!decoded.userId) {
        console.log('Token missing userId');
        return res.status(401).json({ message: 'Not authorized, invalid token structure' });
      }
      
      // Find user by id
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        console.log('User not found with ID from token');
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Error verifying token:', error.message);
      return res.status(401).json({ message: 'Not authorized, token verification failed' });
    }
  } catch (error) {
    console.error('Unexpected error in auth middleware:', error);
    res.status(500).json({ message: 'Server error in auth middleware' });
  }
};

// Check if user is admin
export const admin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Check if user is a professional (architect, engineer, vastu)
export const professional = async (req, res, next) => {
  if (req.user && ['architect', 'engineer', 'vastu'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a professional' });
  }
};
