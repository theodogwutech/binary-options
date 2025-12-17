import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Asset } from '../models/Asset';
import { logger } from '../utils/logger';

export const getAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assetType, isActive } = req.query;

    const filter: any = {};
    if (assetType) filter.assetType = assetType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const assets = await Asset.find(filter).sort({ symbol: 1 });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Assets retrieved successfully',
      data: assets,
    });
  } catch (error) {
    logger.error('Error fetching assets:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch assets',
    });
  }
};

export const getAssetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const asset = await Asset.findById(id);

    if (!asset) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Asset not found',
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Asset retrieved successfully',
      data: asset,
    });
  } catch (error) {
    logger.error('Error fetching asset:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch asset',
    });
  }
};

export const updateAssetPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { currentPrice } = req.body;

    const asset = await Asset.findById(id);
    if (!asset) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Asset not found',
      });
      return;
    }

    const previousPrice = asset.currentPrice;
    const priceChange = currentPrice - previousPrice;
    const priceChangePercent = (priceChange / previousPrice) * 100;

    asset.previousPrice = previousPrice;
    asset.currentPrice = currentPrice;
    asset.priceChange = priceChange;
    asset.priceChangePercent = priceChangePercent;

    await asset.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Asset price updated successfully',
      data: asset,
    });
  } catch (error) {
    logger.error('Error updating asset price:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update asset price',
    });
  }
};
