
import express from 'express';
import { register, login, getProfile, updatePassword, deleteAccount } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/password', protect, updatePassword);
router.delete('/account', protect, deleteAccount);

export default router;
