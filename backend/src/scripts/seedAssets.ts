import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Asset } from '../models/Asset';
import { logger } from '../utils/logger';

dotenv.config();

const sampleAssets = [
  {
    symbol: 'EUR/USD',
    name: 'Euro vs US Dollar',
    assetType: 'forex',
    currentPrice: 1.085,
    previousPrice: 1.0825,
    priceChange: 0.0025,
    priceChangePercent: 0.23,
    isActive: true,
    tradingHours: { start: '00:00', end: '23:59', timezone: 'UTC' },
    minTradeAmount: 10,
    maxTradeAmount: 5000,
    payoutPercentage: 85,
  },
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    assetType: 'crypto',
    currentPrice: 43250.0,
    previousPrice: 42330.0,
    priceChange: 920.0,
    priceChangePercent: 2.17,
    isActive: true,
    tradingHours: { start: '00:00', end: '23:59', timezone: 'UTC' },
    minTradeAmount: 10,
    maxTradeAmount: 10000,
    payoutPercentage: 85,
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound vs US Dollar',
    assetType: 'forex',
    currentPrice: 1.264,
    previousPrice: 1.2663,
    priceChange: -0.0023,
    priceChangePercent: -0.18,
    isActive: true,
    tradingHours: { start: '00:00', end: '23:59', timezone: 'UTC' },
    minTradeAmount: 10,
    maxTradeAmount: 5000,
    payoutPercentage: 85,
  },
  {
    symbol: 'ETH/USD',
    name: 'Ethereum',
    assetType: 'crypto',
    currentPrice: 2340.5,
    previousPrice: 2295.3,
    priceChange: 45.2,
    priceChangePercent: 1.97,
    isActive: true,
    tradingHours: { start: '00:00', end: '23:59', timezone: 'UTC' },
    minTradeAmount: 10,
    maxTradeAmount: 10000,
    payoutPercentage: 85,
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    assetType: 'stock',
    currentPrice: 178.45,
    previousPrice: 176.6,
    priceChange: 1.85,
    priceChangePercent: 1.05,
    isActive: true,
    tradingHours: { start: '14:30', end: '21:00', timezone: 'UTC' },
    minTradeAmount: 10,
    maxTradeAmount: 5000,
    payoutPercentage: 82,
  },
  {
    symbol: 'GOLD',
    name: 'Gold Spot',
    assetType: 'commodity',
    currentPrice: 2058.3,
    previousPrice: 2063.7,
    priceChange: -5.4,
    priceChangePercent: -0.26,
    isActive: true,
    tradingHours: { start: '00:00', end: '23:59', timezone: 'UTC' },
    minTradeAmount: 10,
    maxTradeAmount: 5000,
    payoutPercentage: 83,
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar vs Japanese Yen',
    assetType: 'forex',
    currentPrice: 148.75,
    previousPrice: 148.25,
    priceChange: 0.5,
    priceChangePercent: 0.34,
    isActive: true,
    tradingHours: { start: '00:00', end: '23:59', timezone: 'UTC' },
    minTradeAmount: 10,
    maxTradeAmount: 5000,
    payoutPercentage: 85,
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    assetType: 'stock',
    currentPrice: 242.84,
    previousPrice: 238.45,
    priceChange: 4.39,
    priceChangePercent: 1.84,
    isActive: true,
    tradingHours: { start: '14:30', end: '21:00', timezone: 'UTC' },
    minTradeAmount: 10,
    maxTradeAmount: 5000,
    payoutPercentage: 82,
  },
];

const seedAssets = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');

    await Asset.deleteMany({});
    logger.info('Cleared existing assets');

    const assets = await Asset.insertMany(sampleAssets);
    logger.info(`Successfully seeded ${assets.length} assets`);

    console.log('\n✅ Seeded Assets:');
    assets.forEach((asset) => {
      console.log(`  - ${asset.symbol} (${asset.name}): $${asset.currentPrice}`);
    });

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding assets:', error);
    process.exit(1);
  }
};

seedAssets();
