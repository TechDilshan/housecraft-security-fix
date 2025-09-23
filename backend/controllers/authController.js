
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { sanitizeHtmlFields, sanitizeText } from '../middleware/xssProtectionMiddleware.js';
import { OAuth2Client } from 'google-auth-library';

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register new user
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, phoneNumber, password, role } = req.body;
  
  // Sanitize user input to prevent XSS
  const sanitizedFullName = sanitizeText(fullName);
  const sanitizedEmail = sanitizeText(email);
  const sanitizedPhoneNumber = sanitizeText(phoneNumber);

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }

  // Create new user with sanitized data
  const user = await User.create({
    fullName: sanitizedFullName,
    email: sanitizedEmail,
    phoneNumber: sanitizedPhoneNumber,
    password,
    role: role || 'user'  // Default to 'user' if role is not provided
  });

  // Generate token
  const token = generateToken(user._id);

  // Set httpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  // Send response (without token)
  res.status(201).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profileImage: user.profileImage,
    degree: user.degree
  });
});

// Login user - updated to not require role
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email only - no role filter
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  // Generate token
  const token = generateToken(user._id);

  // Set httpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  // Send response (without token)
  res.json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profileImage: user.profileImage,
    degree: user.degree
  });
});

// Google OAuth login/signup using ID token
export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: 'Google ID token is required' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ message: 'Google OAuth not configured' });
  }

  const client = new OAuth2Client(clientId);
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    payload = ticket.getPayload();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid Google token' });
  }

  const email = payload?.email;
  const fullName = payload?.name || '';
  const picture = payload?.picture || '';
  if (!email) {
    return res.status(400).json({ message: 'Google token missing email' });
  }

  // Helper: generate password that meets model policy (>=8, upper, lower, number, special)
  const generateStrongPassword = () => {
    const upp = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const low = 'abcdefghijklmnopqrstuvwxyz';
    const num = '0123456789';
    const spc = '@$!%*?&';
    const all = upp + low + num + spc;
    const pick = (set) => set[Math.floor(Math.random() * set.length)];
    let pwd = pick(upp) + pick(low) + pick(num) + pick(spc);
    for (let i = 0; i < 12; i++) pwd += pick(all);
    return pwd;
  };

  // Find or create user
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      fullName: sanitizeText(fullName || email.split('@')[0]),
      email,
      phoneNumber: 'N/A',
      password: generateStrongPassword(),
      role: 'user',
      profileImage: picture
    });
  }

  const token = generateToken(user._id);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  return res.json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profileImage: user.profileImage,
    degree: user.degree
  });
});

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Logout user
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Delete account
export const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  await User.deleteOne({ _id: user._id });
  res.clearCookie('token');
  res.json({ message: 'Account deleted successfully' });
});
