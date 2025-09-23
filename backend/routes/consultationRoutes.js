
import express from 'express';
import { 
  createConsultation,
  getConsultationById,
  getConsultationsByProfessional,
  getConsultationsByUser,
  addMessage,
  updateConsultation
} from '../controllers/consultationController.js';
import { protect, professional } from '../middleware/authMiddleware.js';
import { consultationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Create new consultation
router.route('/')
  .post(consultationLimiter, createConsultation);

// Get, update consultation by ID
router.route('/:id')
  .get(getConsultationById)
  .put(updateConsultation);

// Add message to consultation
router.post('/:id/messages', addMessage);

// Get user's consultations - modified to use the authenticated user
router.get('/user/:userId', getConsultationsByUser);

// Get professional's consultations - protect with professional middleware
router.get('/professional/me', professional, getConsultationsByProfessional);

export default router;
