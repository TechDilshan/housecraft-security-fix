import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  // Password field for user authentication
  password: {
    type: String,
    required: true,
    minlength: 8, // Minimum length of 8 characters
    // Custom validator to enforce strong password policy
    validate: {
      validator: function(v) {
        // Must contain at least one lowercase, one uppercase, one digit, and one special character
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
      },
      message: 'Password must contain at least 8 characters with uppercase, lowercase, number and special character'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'engineer', 'architect', 'vastu'],
    default: 'user'
  },
  profileImage: {
    type: String,
    default: ''
  },
  degree: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
