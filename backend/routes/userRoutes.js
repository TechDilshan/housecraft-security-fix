
const express = require('express');
const { 
  getProfessionals,
  getUserById,
  updateProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get professionals by role (public)
router.get('/professionals/:role', getProfessionals);

// Protected routes
router.get('/:id', protect, getUserById);
router.put('/profile', protect, updateProfile);

module.exports = router;
