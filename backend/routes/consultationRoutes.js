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

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.route('/')
  .post(createConsultation)

router.route('/:id')
  .get(getConsultationById)
  .put(updateConsultation);

router.post('/:id/messages', addMessage);

// User routes
router.get('/user/:userId', getConsultationsByUser);

// Professional routes
router.get('/professional/:userId', professional, getConsultationsByProfessional);

export default router;
