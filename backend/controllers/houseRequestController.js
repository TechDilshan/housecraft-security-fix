import { HouseRequest } from '../models/HouseRequest.js';
import { House } from '../models/House.js';
import { User } from '../models/User.js';

// Create a house request
export const createHouseRequest = async (req, res) => {
  try {
    const { houseId } = req.body;
    const userId = req.user._id;

    // Check if house exists
    const house = await House.findById(houseId);
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }

    // Check if user already requested this house
    const existingRequest = await HouseRequest.findOne({ userId, houseId });
    if (existingRequest) {
      return res.status(400).json({ message: 'You have already requested this house' });
    }

    // Create new request
    const houseRequest = await HouseRequest.create({
      userId,
      houseId,
      status: 'pending'
    });

    res.status(201).json(houseRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all house requests (admin only)
export const getHouseRequests = async (req, res) => {
  try {
    const requests = await HouseRequest.find()
      .populate('userId', 'fullName email phoneNumber')
      .populate('houseId', 'title location price')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update house request status (admin only)
export const updateHouseRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const request = await HouseRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    request.status = status;
    await request.save();
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};