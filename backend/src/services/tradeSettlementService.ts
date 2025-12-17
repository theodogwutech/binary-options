import { Trade } from '../models/Trade';
import { User } from '../models/User';
import { Asset } from '../models/Asset';
import { Transaction } from '../models/Transaction';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Automatically settle expired trades
 * This runs periodically to check for trades past their expiry time
 */
export const settleExpiredTrades = async (): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    const expiredTrades = await Trade.find({
      status: 'active',
      expiryTime: { $lte: new Date() },
    }).populate('asset user');

    if (expiredTrades.length === 0) {
      return;
    }

    logger.info(`Found ${expiredTrades.length} expired trades to settle`);

    for (const trade of expiredTrades) {
      try {
        await session.startTransaction();

        const asset = await Asset.findById(trade.asset);
        if (!asset) {
          logger.error(`Asset not found for trade ${trade._id}`);
          await session.abortTransaction();
          continue;
        }

        trade.exitPrice = asset.currentPrice;
        trade.closedAt = new Date();

        let result: 'win' | 'loss' | 'draw';
        let status: 'won' | 'lost' | 'cancelled';

        if (trade.tradeType === 'call') {
          if (asset.currentPrice > trade.entryPrice) {
            result = 'win';
            status = 'won';
          } else if (asset.currentPrice < trade.entryPrice) {
            result = 'loss';
            status = 'lost';
          } else {
            result = 'draw';
            status = 'cancelled';
          }
        } else {
          if (asset.currentPrice < trade.entryPrice) {
            result = 'win';
            status = 'won';
          } else if (asset.currentPrice > trade.entryPrice) {
            result = 'loss';
            status = 'lost';
          } else {
            result = 'draw';
            status = 'cancelled';
          }
        }

        trade.result = result;
        trade.status = status;

        await trade.save({ session });

        // Update user balance
        const user = await User.findById(trade.user).session(session);
        if (!user) {
          logger.error(`User not found for trade ${trade._id}`);
          await session.abortTransaction();
          continue;
        }

        if (status === 'won') {
          const winAmount = trade.amount + trade.payout;
          user.balance += winAmount;

          await Transaction.create(
            [
              {
                user: user._id,
                type: 'trade',
                amount: winAmount,
                currency: user.currency,
                status: 'completed',
                description: `Trade won: ${asset.symbol} ${trade.tradeType.toUpperCase()}`,
                metadata: { tradeId: trade._id },
                processedAt: new Date(),
              },
            ],
            { session }
          );

          logger.info(`Trade ${trade._id} settled as WIN. User won $${trade.payout}`);
        } else if (status === 'cancelled') {
          user.balance += trade.amount;

          await Transaction.create(
            [
              {
                user: user._id,
                type: 'trade',
                amount: trade.amount,
                currency: user.currency,
                status: 'completed',
                description: `Trade tied: ${asset.symbol} ${trade.tradeType.toUpperCase()}`,
                metadata: { tradeId: trade._id },
                processedAt: new Date(),
              },
            ],
            { session }
          );

          logger.info(`Trade ${trade._id} settled as TIE. Amount returned: $${trade.amount}`);
        } else {
          logger.info(`Trade ${trade._id} settled as LOSS. User lost $${trade.amount}`);
        }

        await user.save({ session });
        await session.commitTransaction();

        logger.info(
          `Trade ${trade._id} automatically settled: ${result.toUpperCase()} | Entry: $${trade.entryPrice} | Exit: $${trade.exitPrice} | P/L: $${trade.profit}`
        );
      } catch (error) {
        await session.abortTransaction();
        logger.error(`Failed to settle trade ${trade._id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in settleExpiredTrades:', error);
  } finally {
    session.endSession();
  }
};

/**
 * Start the trade settlement service
 * Checks for expired trades every 10 seconds
 */
export const startTradeSettlementService = (): void => {
  logger.info('Starting trade settlement service...');

  settleExpiredTrades();

  setInterval(() => {
    settleExpiredTrades();
  }, 10000); // 10 seconds

  logger.info('Trade settlement service started (checking every 10 seconds)');
};
