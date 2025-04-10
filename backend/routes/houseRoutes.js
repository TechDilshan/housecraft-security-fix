
import express from 'express';
import {
  createHouse,
  getHouses,
  getHouseById,
  updateHouse,
  deleteHouse
} from '../controllers/houseController.js';
import {
  createHouseRequest,
  getHouseRequests,
  updateHouseRequestStatus
} from '../controllers/houseRequestController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getHouses);
router.get('/:id', getHouseById);

// Protected routes
router.use(protect);
router.post('/requests', createHouseRequest);

// Admin routes
router.post('/', admin, createHouse);
router.put('/:id', admin, updateHouse);
router.delete('/:id', admin, deleteHouse);
router.get('/requests/all', admin, getHouseRequests);
router.put('/requests/:id', admin, updateHouseRequestStatus);

export default router;
