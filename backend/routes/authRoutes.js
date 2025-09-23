
import express from 'express';
import { register, login, logout, getProfile, updatePassword, deleteAccount } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateUserRegistration, validateUserLogin, validateUpdatePassword } from '../middleware/validationMiddleware.js';
import { authLimiter, registerLimiter, passwordLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', registerLimiter, validateUserRegistration, register);
router.post('/login', authLimiter, validateUserLogin, login);
router.post('/logout', logout);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/password', passwordLimiter, protect, validateUpdatePassword, updatePassword);
router.delete('/account', protect, deleteAccount);

export default router;
