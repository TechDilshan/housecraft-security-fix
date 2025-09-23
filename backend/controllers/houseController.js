import { House } from '../models/House.js';
import { sanitizeHtmlFields, sanitizeText, sanitizeUrl } from '../middleware/xssProtectionMiddleware.js';

// Get all houses
export const getHouses = async (req, res) => {
  try {
    // Parse filters from query params
    const filters = {};
    
    if (req.query.houseType) {
      filters.houseType = req.query.houseType;
    }
    
    if (req.query.available !== undefined) {
      filters.available = req.query.available === 'true';
    }
    
    const houses = await House.find(filters).sort({ createdAt: -1 });
    res.json(houses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get house by ID
export const getHouseById = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }
    res.json(house);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new house (admin only)
export const createHouse = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      price,
      houseType,
      images,
      available
    } = req.body;

    const house = await House.create({
      title,
      description,
      location,
      price,
      houseType,
      images,
      available: available !== undefined ? available : true
    });

    res.status(201).json(house);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update house (admin only)
export const updateHouse = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      price,
      houseType,
      images,
      available
    } = req.body;

    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }

    // Update fields
    if (title !== undefined) house.title = title;
    if (description !== undefined) house.description = description;
    if (location !== undefined) house.location = location;
    if (price !== undefined) house.price = price;
    if (houseType !== undefined) house.houseType = houseType;
    if (images !== undefined) house.images = images;
    if (available !== undefined) house.available = available;
    
    house.updatedAt = Date.now();

    const updatedHouse = await house.save();
    res.json(updatedHouse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete house (admin only)
export const deleteHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }

    // Update to use findByIdAndDelete instead of remove() which is deprecated
    await House.findByIdAndDelete(req.params.id);
    res.json({ message: 'House removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
