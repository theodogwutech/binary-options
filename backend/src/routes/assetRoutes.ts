import express from 'express';
import { getAssets, getAssetById, updateAssetPrice } from '../controllers/assetController';

const router = express.Router();

router.get('/', getAssets);
router.get('/:id', getAssetById);
router.put('/:id/price', updateAssetPrice);

export default router;
