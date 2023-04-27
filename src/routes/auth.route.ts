import express from 'express';
import authController from '../controllers/auth.controller';

const router = express.Router();

router.get('/strava', authController.authenticateStrava);

export default router;
