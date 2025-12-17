import mongoose, { Document, Schema } from 'mongoose';

export interface ITrade extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  asset: mongoose.Types.ObjectId;
  tradeType: 'call' | 'put';
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  expiryTime: Date;
  status: 'pending' | 'active' | 'won' | 'lost' | 'cancelled';
  profit: number;
  payout: number;
  payoutPercentage: number;
  commission: number;
  result?: 'win' | 'loss' | 'draw';
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tradeSchema = new Schema<ITrade>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    asset: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    tradeType: {
      type: String,
      required: true,
      enum: ['call', 'put'],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    entryPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    exitPrice: {
      type: Number,
      min: 0,
    },
    expiryTime: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'active', 'won', 'lost', 'cancelled'],
      default: 'active',
      index: true,
    },
    profit: {
      type: Number,
      default: 0,
    },
    payout: {
      type: Number,
      default: 0,
    },
    payoutPercentage: {
      type: Number,
      required: true,
      default: 85,
    },
    commission: {
      type: Number,
      default: 0,
    },
    result: {
      type: String,
      enum: ['win', 'loss', 'draw'],
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
tradeSchema.index({ user: 1, status: 1 });
tradeSchema.index({ user: 1, createdAt: -1 });
tradeSchema.index({ expiryTime: 1, status: 1 });
tradeSchema.index({ asset: 1, status: 1 });
tradeSchema.index({ createdAt: -1 });

// Calculate profit before saving
tradeSchema.pre('save', function (next) {
  if (this.status === 'won') {
    this.payout = this.amount * (this.payoutPercentage / 100);
    this.profit = this.payout;
  } else if (this.status === 'lost') {
    this.profit = -this.amount;
    this.payout = 0;
  }
  next();
});

export const Trade = mongoose.model<ITrade>('Trade', tradeSchema);
