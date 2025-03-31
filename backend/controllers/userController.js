
const User = require('../models/User');

// Get professionals by role
exports.getProfessionals = async (req, res) => {
  try {
    const { role } = req.params;
    
    // Validate role
    if (!['engineer', 'architect', 'vastu'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
    
    const professionals = await User.find({ role })
      .select('-password')
      .sort({ fullName: 1 });
      
    res.json(professionals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, profileImage, degree } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (profileImage) user.profileImage = profileImage;
    if (degree) user.degree = degree;
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      degree: updatedUser.degree
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
