import express from 'express';
import usersController from '../controllers/users.controller';
import activitiesController from '../controllers/activities.controller';
import impactController from '../controllers/impact.controller';
import { authenticateToken, userHasAuthorization } from '../middlewares/authentication.middleware';

const router = express.Router();

router.all('/:userId*', authenticateToken, userHasAuthorization, usersController.userExists);

// Impact
router.get('/:userId/impact/emissionsAvoided', impactController.getEmissionsAvoidedByUser);

// Activities
router.get('/:userId/activities/', activitiesController.get);
router.get('/:userId/activities/fetchLatest', activitiesController.fetchLatest);
router.get('/:userId/activities/:activityId', activitiesController.activityExists, activitiesController.getOne);
router.put('/:userId/activities/:activityId', activitiesController.activityExists, activitiesController.update);

// Base
router.get('/:userId', usersController.getOne);
router.put('/:userId', usersController.update);
router.get('/:userId/onboard', usersController.onboard);
router.delete('/:userId', usersController.remove);

export default router;