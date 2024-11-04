import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['user', 'agent'])
    .withMessage('Invalid role')
], authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

router.post('/verify-email/:token', authController.verifyEmail);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please enter a valid email')
], authController.forgotPassword);

router.post('/reset-password/:token', [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], authController.resetPassword);

export default router;