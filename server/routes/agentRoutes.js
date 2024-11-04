import express from 'express';
import { body } from 'express-validator';
import * as agentController from '../controllers/agentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('agent'));

// Availability management routes
router.get('/availability', agentController.getAvailability);
router.post('/availability', [
  body('availabilitySlots').isArray(),
  body('availabilitySlots.*.day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  body('availabilitySlots.*.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('availabilitySlots.*.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('maxAppointmentsPerDay').isInt({ min: 1, max: 20 }).optional()
], agentController.setAvailability);

// Out of office management
router.post('/out-of-office', [
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('reason').trim().notEmpty()
], agentController.addOutOfOffice);

router.delete('/out-of-office/:id', agentController.removeOutOfOffice);

export default router;