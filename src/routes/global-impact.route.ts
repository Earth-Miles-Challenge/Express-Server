import express from 'express';
import impactController from '../controllers/impact.controller';

const router = express.Router();

router.get('/emissionsAvoided', impactController.getEmissionsAvoided);

export default router;
