import mongoose, { Document, Schema } from 'mongoose';

export interface IAsset extends Document {
  _id: mongoose.Types.ObjectId;
  symbol: string;
  name: string;
  assetType: 'forex' | 'crypto' | 'stock' | 'commodity' | 'index';
  currentPrice: number;
  previousPrice: number;
  priceChange: number;
  priceChangePercent: number;
  isActive: boolean;
  tradingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  minTradeAmount: number;
  maxTradeAmount: number;
  payoutPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    assetType: {
      type: String,
      required: true,
      enum: ['forex', 'crypto', 'stock', 'commodity', 'index'],
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    previousPrice: {
      type: Number,
      default: 0,
    },
    priceChange: {
      type: Number,
      default: 0,
    },
    priceChangePercent: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tradingHours: {
      start: {
        type: String,
        default: '00:00',
      },
      end: {
        type: String,
        default: '23:59',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
    },
    minTradeAmount: {
      type: Number,
      default: 10,
      min: 0,
    },
    maxTradeAmount: {
      type: Number,
      default: 10000,
      min: 0,
    },
    payoutPercentage: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
assetSchema.index({ symbol: 1 });
assetSchema.index({ assetType: 1, isActive: 1 });
assetSchema.index({ isActive: 1 });

export const Asset = mongoose.model<IAsset>('Asset', assetSchema);
