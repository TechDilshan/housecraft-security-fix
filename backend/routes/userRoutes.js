import express from 'express';
import {
  updateProfile,
  getAllUsers,
  getUserById,
  deleteUser
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.use(protect);
router.put('/profile', updateProfile);

// Admin only routes
router.use(admin);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.delete('/:id', deleteUser);

export default router;
