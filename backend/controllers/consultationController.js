import { ConsultationRequest } from '../models/ConsultationRequest.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

// Create consultation request
export const createConsultation = async (req, res) => {
  try {
    const { professionalId, consultationType, houseId, message } = req.body;

    // Use req.user._id directly since it's already an ObjectId
    const userId = req.user._id;
    
    // Create consultation request with initial message
    const consultationRequest = await ConsultationRequest.create({
      userId,
      professionalId,  // MongoDB will handle the ObjectId conversion
      consultationType,
      houseId,         // MongoDB will handle the ObjectId conversion
      messages: [{
        senderId: userId,
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
    console.error('Consultation creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get consultation by ID
export const getConsultationById = async (req, res) => {
  try {

    const consultation = await ConsultationRequest.findOne({ _id: req.params.id })
      .populate('userId', 'fullName email profileImage')
      .populate('professionalId', 'fullName email profileImage degree role');

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    

    // Check if user is authorized to view this consultation
    // if (
    //   consultation.userId.toString() !== req.user._id.toString() && 
    //   consultation.professionalId.toString() !== req.user._id.toString() &&
    //   req.user.role !== 'admin'
    // ) {
    //   return res.status(403).json({ message: 'Not authorized to view this consultation' });
    // }

    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get consultations by user
export const getConsultationsByUser = async (req, res) => {
  try {
    const consultations = await ConsultationRequest.find({ userId: req.user._id })
      .populate('professionalId', 'fullName email profileImage degree role')
      .populate('houseId', 'title images')
      .sort({ updatedAt: -1 });

    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get consultations by professional
export const getConsultationsByProfessional = async (req, res) => {
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
export const addMessage = async (req, res) => {
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
export const updateConsultation = async (req, res) => {
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
