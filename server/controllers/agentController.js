import { validationResult } from 'express-validator';
import AgentAvailability from '../models/AgentAvailability.js';

export const getAvailability = async (req, res) => {
  try {
    let availability = await AgentAvailability.findOne({ agent: req.user._id });
    
    if (!availability) {
      availability = await AgentAvailability.create({
        agent: req.user._id,
        availabilitySlots: []
      });
    }

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const setAvailability = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { availabilitySlots, maxAppointmentsPerDay } = req.body;

    // Validate time slots don't overlap
    const isValid = validateTimeSlots(availabilitySlots);
    if (!isValid) {
      return res.status(400).json({ message: 'Time slots cannot overlap' });
    }

    let availability = await AgentAvailability.findOne({ agent: req.user._id });

    if (availability) {
      availability.availabilitySlots = availabilitySlots;
      if (maxAppointmentsPerDay) {
        availability.maxAppointmentsPerDay = maxAppointmentsPerDay;
      }
      await availability.save();
    } else {
      availability = await AgentAvailability.create({
        agent: req.user._id,
        availabilitySlots,
        maxAppointmentsPerDay: maxAppointmentsPerDay || 8
      });
    }

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addOutOfOffice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate, reason } = req.body;

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    let availability = await AgentAvailability.findOne({ agent: req.user._id });
    if (!availability) {
      availability = await AgentAvailability.create({
        agent: req.user._id,
        availabilitySlots: []
      });
    }

    availability.outOfOffice.push({ startDate, endDate, reason });
    await availability.save();

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const removeOutOfOffice = async (req, res) => {
  try {
    const availability = await AgentAvailability.findOne({ agent: req.user._id });
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    availability.outOfOffice = availability.outOfOffice.filter(
      item => item._id.toString() !== req.params.id
    );
    await availability.save();

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to validate time slots don't overlap
const validateTimeSlots = (slots) => {
  for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
    const daySlots = slots.filter(slot => slot.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (let i = 1; i < daySlots.length; i++) {
      if (daySlots[i].startTime <= daySlots[i-1].endTime) {
        return false;
      }
    }
  }
  return true;
};