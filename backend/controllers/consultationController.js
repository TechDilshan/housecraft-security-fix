
const ConsultationRequest = require('../models/ConsultationRequest');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create consultation request
exports.createConsultation = async (req, res) => {
  try {
    const { professionalId, consultationType, houseId, message } = req.body;

    // Check if professional exists
    const professional = await User.findById(professionalId);
    if (!professional || professional.role !== consultationType) {
      return res.status(404).json({ message: 'Professional not found' });
    }

    // Create consultation request with initial message
    const consultationRequest = await ConsultationRequest.create({
      userId: req.user._id,
      professionalId,
      consultationType,
      houseId: houseId || null,
      messages: [{
        senderId: req.user._id,
        recipientId: professionalId,
        content: message
      }]
    });

    // Populate user and professional details for response
    const populatedRequest = await ConsultationRequest.findById(consultationRequest._id)
      .populate('userId', 'fullName email profileImage')
      .populate('professionalId', 'fullName email profileImage degree role');

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get consultation by ID
exports.getConsultationById = async (req, res) => {
  try {
    const consultation = await ConsultationRequest.findById(req.params.id)
      .populate('userId', 'fullName email profileImage')
      .populate('professionalId', 'fullName email profileImage degree role');

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Check if user is authorized to view this consultation
    if (
      consultation.userId._id.toString() !== req.user._id.toString() && 
      consultation.professionalId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this consultation' });
    }

    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get consultations by user
exports.getConsultationsByUser = async (req, res) => {
  try {
    const consultations = await ConsultationRequest.find({ userId: req.user._id })
      .populate('professionalId', 'fullName email profileImage degree role')
      .populate('houseId', 'title images')
      .sort({ updatedAt: -1 });

    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get consultations by professional
exports.getConsultationsByProfessional = async (req, res) => {
  try {
    const consultations = await ConsultationRequest.find({ professionalId: req.user._id })
      .populate('userId', 'fullName email profileImage')
      .populate('houseId', 'title images')
      .sort({ updatedAt: -1 });

    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add message to consultation
exports.addMessage = async (req, res) => {
  try {
    const { content, recipientId } = req.body;
    const senderId = req.user._id;
    
    const consultation = await ConsultationRequest.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Check if user is authorized to add messages
    if (
      consultation.userId.toString() !== senderId.toString() && 
      consultation.professionalId.toString() !== senderId.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to add messages to this consultation' });
    }

    // Create and add message
    const newMessage = {
      senderId,
      recipientId,
      content,
      timestamp: Date.now()
    };

    consultation.messages.push(newMessage);
    consultation.updatedAt = Date.now();
    await consultation.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update consultation status
exports.updateConsultationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'accepted', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const consultation = await ConsultationRequest.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Only professionals or admins can update status
    if (
      consultation.professionalId.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to update status' });
    }

    consultation.status = status;
    consultation.updatedAt = Date.now();
    const updatedConsultation = await consultation.save();

    res.json(updatedConsultation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
