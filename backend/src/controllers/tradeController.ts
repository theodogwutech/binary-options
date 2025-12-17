import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthRequest } from '../middleware/auth';
import { Trade } from '../models/Trade';
import { User } from '../models/User';
import { Asset } from '../models/Asset';
import { Transaction } from '../models/Transaction';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export const createTrade = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { assetId, tradeType, amount, expiryMinutes } = req.body;
    const userId = req.user!.userId;

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (user.balance < amount) {
      await session.abortTransaction();
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Insufficient balance',
      });
      return;
    }

    const asset = await Asset.findById(assetId).session(session);
    if (!asset || !asset.isActive) {
      await session.abortTransaction();
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Asset not found or inactive',
      });
      return;
    }

    if (amount < asset.minTradeAmount || amount > asset.maxTradeAmount) {
      await session.abortTransaction();
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Trade amount must be between ${asset.minTradeAmount} and ${asset.maxTradeAmount}`,
      });
      return;
    }

    const expiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const trade = await Trade.create(
      [
        {
          user: userId,
          asset: assetId,
          tradeType,
          amount,
          entryPrice: asset.currentPrice,
          expiryTime,
          status: 'active',
          payoutPercentage: asset.payoutPercentage,
        },
      ],
      { session }
    );

    user.balance -= amount;
    await user.save({ session });

    await Transaction.create(
      [
        {
          user: userId,
          type: 'trade',
          amount: -amount,
          currency: user.currency,
          status: 'completed',
          description: `Trade opened: ${asset.symbol} ${tradeType.toUpperCase()}`,
          metadata: { tradeId: trade[0]._id },
          processedAt: new Date(),
        },
      ],
      { session }
    );

    await session.commitTransaction();

    logger.info(`Trade created: ${trade[0]._id} by user ${userId}`);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Trade created successfully',
      data: {
        trade: trade[0],
        balance: user.balance,
      },
    });
  } catch (error: any) {
    await session.abortTransaction();
    logger.error('Trade creation error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create trade',
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

export const getUserTrades = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = { user: userId };
    if (status) {
      // If status is 'closed', include all non-active trades (won, lost, cancelled)
      if (status === 'closed') {
        query.status = { $in: ['won', 'lost', 'cancelled'] };
      } else {
        query.status = status;
      }
    }

    const trades = await Trade.find(query)
      .populate('asset', 'symbol name assetType')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Trade.countDocuments(query);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        trades,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get user trades error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch trades',
      error: error.message,
    });
  }
};

export const getTradeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const trade = await Trade.findOne({ _id: id, user: userId }).populate(
      'asset',
      'symbol name assetType currentPrice'
    );

    if (!trade) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Trade not found',
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: { trade },
    });
  } catch (error: any) {
    logger.error('Get trade by ID error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch trade',
      error: error.message,
    });
  }
};

export const closeTrade = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const trade = await Trade.findOne({
      _id: id,
      user: userId,
      status: 'active',
    }).session(session);

    if (!trade) {
      await session.abortTransaction();
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Active trade not found',
      });
      return;
    }

    const asset = await Asset.findById(trade.asset).session(session);
    if (!asset) {
      await session.abortTransaction();
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Asset not found',
      });
      return;
    }

    trade.exitPrice = asset.currentPrice;
    trade.closedAt = new Date();

    let result: 'win' | 'loss' | 'draw';
    if (trade.tradeType === 'call') {
      if (asset.currentPrice > trade.entryPrice) {
        result = 'win';
        trade.status = 'won';
      } else if (asset.currentPrice < trade.entryPrice) {
        result = 'loss';
        trade.status = 'lost';
      } else {
        result = 'draw';
        trade.status = 'cancelled';
      }
    } else {
      if (asset.currentPrice < trade.entryPrice) {
        result = 'win';
        trade.status = 'won';
      } else if (asset.currentPrice > trade.entryPrice) {
        result = 'loss';
        trade.status = 'lost';
      } else {
        result = 'draw';
        trade.status = 'cancelled';
      }
    }

    trade.result = result;
    await trade.save({ session });

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (trade.status === 'won') {
      const winAmount = trade.amount + trade.payout;
      user.balance += winAmount;

      await Transaction.create(
        [
          {
            user: userId,
            type: 'trade',
            amount: winAmount,
            currency: user.currency,
            status: 'completed',
            description: `Trade won: ${asset.symbol}`,
            metadata: { tradeId: trade._id },
            processedAt: new Date(),
          },
        ],
        { session }
      );
    } else if (trade.status === 'cancelled') {
      user.balance += trade.amount;

      await Transaction.create(
        [
          {
            user: userId,
            type: 'trade',
            amount: trade.amount,
            currency: user.currency,
            status: 'completed',
            description: `Trade cancelled: ${asset.symbol}`,
            metadata: { tradeId: trade._id },
            processedAt: new Date(),
          },
        ],
        { session }
      );
    }

    await user.save({ session });

    await session.commitTransaction();

    logger.info(`Trade closed: ${trade._id}, result: ${result}`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Trade closed successfully',
      data: {
        trade,
        balance: user.balance,
      },
    });
  } catch (error: any) {
    await session.abortTransaction();
    logger.error('Close trade error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to close trade',
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

export const getTradeStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const stats = await Trade.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalTrades: { $sum: 1 },
          wonTrades: {
            $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] },
          },
          lostTrades: {
            $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] },
          },
          totalProfit: { $sum: '$profit' },
          totalInvested: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$amount', 0] },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalTrades: 0,
      wonTrades: 0,
      lostTrades: 0,
      totalProfit: 0,
      totalInvested: 0,
    };

    const winRate =
      result.totalTrades > 0
        ? ((result.wonTrades / result.totalTrades) * 100).toFixed(2)
        : 0;

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        ...result,
        winRate: `${winRate}%`,
      },
    });
  } catch (error: any) {
    logger.error('Get trade stats error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch trade statistics',
      error: error.message,
    });
  }
};
