import Joi from 'joi';

// Validation schemas
const userRegistrationSchema = Joi.object({
  fullName: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required(),
  role: Joi.string().valid('user', 'admin', 'engineer', 'architect', 'vastu').default('user')
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required()
});

const houseSchema = Joi.object({
  title: Joi.string().min(5).max(100).trim().required(),
  description: Joi.string().min(20).max(1000).trim().required(),
  location: Joi.string().min(3).max(100).trim().required(),
  price: Joi.number().positive().required(),
  houseType: Joi.string().valid('single', 'two', 'three', 'box').required(),
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
  available: Joi.boolean().default(true)
});

const consultationSchema = Joi.object({
  professionalId: Joi.string().hex().length(24).required(),
  consultationType: Joi.string().valid('engineer', 'architect', 'vastu').required(),
  houseId: Joi.string().hex().length(24).optional(),
  message: Joi.string().min(1).max(500).trim().required()
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(50).trim().optional(),
  phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  profileImage: Joi.string().uri().optional(),
  degree: Joi.string().max(100).trim().optional()
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: errorMessages
      });
    }
    
    next();
  };
};

// Export validation middleware functions
export const validateUserRegistration = validate(userRegistrationSchema);
export const validateUserLogin = validate(userLoginSchema);
export const validateHouse = validate(houseSchema);
export const validateConsultation = validate(consultationSchema);
export const validateUpdatePassword = validate(updatePasswordSchema);
export const validateUpdateProfile = validate(updateProfileSchema);

// Parameter validation for MongoDB ObjectIds
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        message: `Invalid ${paramName} format`
      });
    }
    next();
  };
};

