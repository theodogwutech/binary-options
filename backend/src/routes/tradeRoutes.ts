import express from 'express';
import {
  createTrade,
  getUserTrades,
  getTradeById,
  closeTrade,
  getTradeStats,
} from '../controllers/tradeController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.post('/', createTrade);
router.get('/', getUserTrades);
router.get('/stats', getTradeStats);
router.get('/:id', getTradeById);
router.post('/:id/close', closeTrade);

export default router;
