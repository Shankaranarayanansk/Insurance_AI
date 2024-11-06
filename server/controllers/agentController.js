import { validationResult } from 'express-validator';
import AgentAvailability from '../models/AgentAvailability.js';

export const getAvailability = async (req, res) => {
  try {
    let availability = await AgentAvailability.findOne({ agent: req.user._id });
    
    if (!availability) {
      availability = await AgentAvailability.create({
        agent: req.user._id,
        availabilitySlots: [],
        timezone: 'UTC'
      });
    }

    res.json(availability);
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const setAvailability = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid input data',
        errors: errors.array() 
      });
    }

    const { availabilitySlots, maxAppointmentsPerDay, timezone } = req.body;

    let availability = await AgentAvailability.findOne({ agent: req.user._id });

    if (availability) {
      availability.availabilitySlots = availabilitySlots;
      if (maxAppointmentsPerDay) {
        availability.maxAppointmentsPerDay = maxAppointmentsPerDay;
      }
      if (timezone) {
        availability.timezone = timezone;
      }
      await availability.save();
    } else {
      availability = await AgentAvailability.create({
        agent: req.user._id,
        availabilitySlots,
        maxAppointmentsPerDay: maxAppointmentsPerDay || 8,
        timezone: timezone || 'UTC'
      });
    }

    res.json(availability);
  } catch (error) {
    console.error('Set availability error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to update availability',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const addOutOfOffice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid input data',
        errors: errors.array() 
      });
    }

    const { startDate, endDate, reason } = req.body;

    let availability = await AgentAvailability.findOne({ agent: req.user._id });
    if (!availability) {
      availability = await AgentAvailability.create({
        agent: req.user._id,
        availabilitySlots: []
      });
    }

    // Check for overlapping out-of-office periods
    const hasOverlap = availability.outOfOffice.some(period => 
      (new Date(startDate) <= period.endDate && new Date(endDate) >= period.startDate)
    );

    if (hasOverlap) {
      return res.status(400).json({ 
        message: 'New out-of-office period overlaps with existing ones' 
      });
    }

    availability.outOfOffice.push({ startDate, endDate, reason });
    await availability.save();

    res.json(availability);
  } catch (error) {
    console.error('Add out of office error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to add out-of-office period',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const removeOutOfOffice = async (req, res) => {
  try {
    const availability = await AgentAvailability.findOne({ agent: req.user._id });
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    const outOfOfficeIndex = availability.outOfOffice.findIndex(
      item => item._id.toString() === req.params.id
    );

    if (outOfOfficeIndex === -1) {
      return res.status(404).json({ message: 'Out-of-office period not found' });
    }

    availability.outOfOffice.splice(outOfOfficeIndex, 1);
    await availability.save();

    res.json(availability);
  } catch (error) {
    console.error('Remove out of office error:', error);
    res.status(500).json({ 
      message: 'Failed to remove out-of-office period',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }

    const availability = await AgentAvailability.findOne({ agent: req.params.agentId });
    if (!availability) {
      return res.status(404).json({ message: 'Agent availability not found' });
    }

    const queryDate = new Date(date);
    const slots = availability.getAvailableSlotsForDay(queryDate);

    res.json({ slots });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch available slots',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};