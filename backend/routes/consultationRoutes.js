
const express = require('express');
const { 
  createConsultation,
  getConsultationById,
  getConsultationsByUser,
  getConsultationsByProfessional,
  addMessage,
  updateConsultationStatus
} = require('../controllers/consultationController');
const { protect, professional } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.post('/', protect, createConsultation);
router.get('/:id', protect, getConsultationById);
router.get('/user/me', protect, getConsultationsByUser);
router.get('/professional/me', protect, professional, getConsultationsByProfessional);
router.post('/:id/messages', protect, addMessage);
router.put('/:id/status', protect, professional, updateConsultationStatus);

module.exports = router;
