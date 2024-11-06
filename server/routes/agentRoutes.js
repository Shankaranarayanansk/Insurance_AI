import express from 'express';
import { body, query } from 'express-validator';
import * as agentController from '../controllers/agentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('agent'));

// Get agent's availability
router.get('/availability', agentController.getAvailability);

// Set availability
router.post('/availability', [
  body('availabilitySlots').isArray(),
  body('availabilitySlots.*.day')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day of week'),
  body('availabilitySlots.*.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:mm format'),
  body('availabilitySlots.*.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:mm format'),
  body('maxAppointmentsPerDay')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Max appointments must be between 1 and 20'),
  body('timezone')
    .optional()
    .isString()
    .withMessage('Invalid timezone')
], agentController.setAvailability);

// Add out of office period
router.post('/out-of-office', [
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('reason')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Reason must be between 3 and 200 characters')
], agentController.addOutOfOffice);

// Remove out of office period
router.delete('/out-of-office/:id', agentController.removeOutOfOffice);

// Get available slots for a specific date
router.get('/available-slots/:agentId', [
  query('date')
    .isISO8601()
    .withMessage('Invalid date format')
], agentController.getAvailableSlots);

export default router;