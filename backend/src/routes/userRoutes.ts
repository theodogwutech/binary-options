import express from 'express';
import { fundBalance, getUserProfile } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/fund', fundBalance);
router.get('/profile', getUserProfile);

export default router;
