import express from 'express';
import {
  createHouse,
  getHouses,
  getHouseById,
  updateHouse,
  deleteHouse
} from '../controllers/houseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

import {
  createHouseRequest,
  getHouseRequests,
  updateHouseRequestStatus
} from '../controllers/houseRequestController.js';

const router = express.Router();

// Public routes
router.get('/', getHouses);
router.get('/:id', getHouseById);

// Protected routes
router.use(protect);
router.post('/', createHouse);
router.put('/:id', updateHouse);
router.delete('/:id', deleteHouse);


router.post('/requests', createHouseRequest);
router.get('/requests/all',admin, getHouseRequests);
router.put('/requests/:id', updateHouseRequestStatus);
export default router;
