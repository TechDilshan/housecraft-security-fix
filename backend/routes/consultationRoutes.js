import express from 'express';
import { 
  createConsultation,
  getConsultations,
  getConsultationById,
  getConsultationsByProfessional,
  addMessage,
  updateConsultation
} from '../controllers/consultationController.js';
import { protect, professional } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.route('/')
  .post(createConsultation)
  .get(getConsultations);

router.route('/:id')
  .get(getConsultationById)
  .put(updateConsultation);

router.post('/:id/messages', addMessage);

// Professional routes
router.get('/professional/me', professional, getConsultationsByProfessional);

export default router;
