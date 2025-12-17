import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { User } from '../models/User';
import { logger } from '../utils/logger';

/**
 * @desc    Add funds to user balance
 * @route   POST /api/users/fund
 * @access  Private
 */
export const fundBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, paymentMethod } = req.body;
    const userId = (req as any).user.userId;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid amount. Amount must be a positive number.',
      });
      return;
    }

    if (amount < 10) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Minimum funding amount is $10.',
      });
      return;
    }

    if (amount > 10000) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Maximum funding amount is $10,000.',
      });
      return;
    }

    // Validate payment method
    const validPaymentMethods = ['card', 'crypto', 'bank'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid payment method. Must be one of: card, crypto, bank.',
      });
      return;
    }

    // Find user and update balance
    const user = await User.findById(userId);

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    // Add funds to balance
    const previousBalance = user.balance;
    user.balance += amount;
    await user.save();

    logger.info(`User ${userId} funded balance: $${amount} via ${paymentMethod}. New balance: $${user.balance}`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Funds added successfully',
      data: {
        previousBalance,
        amountAdded: amount,
        newBalance: user.balance,
        paymentMethod,
      },
    });
  } catch (error) {
    logger.error('Error funding balance:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to add funds. Please try again.',
    });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Error getting user profile:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get user profile.',
    });
  }
};
