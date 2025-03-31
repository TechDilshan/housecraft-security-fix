
const express = require('express');
const { 
  getHouses, 
  getHouseById, 
  createHouse, 
  updateHouse, 
  deleteHouse 
} = require('../controllers/houseController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getHouses);
router.get('/:id', getHouseById);

// Protected admin-only routes
router.post('/', protect, admin, createHouse);
router.put('/:id', protect, admin, updateHouse);
router.delete('/:id', protect, admin, deleteHouse);

module.exports = router;
