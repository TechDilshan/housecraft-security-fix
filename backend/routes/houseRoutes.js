import express from 'express';
import {
  createHouse,
  getHouses,
  getHouseById,
  updateHouse,
  deleteHouse
} from '../controllers/houseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getHouses);
router.get('/:id', getHouseById);

// Protected routes
router.use(protect);
router.post('/', createHouse);
router.put('/:id', updateHouse);
router.delete('/:id', deleteHouse);

export default router;
