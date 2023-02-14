const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const activitiesController = require('../controllers/activities.controller');
const impactController = require('../controllers/impact.controller');
const { authenticateToken, userHasAuthorization } = require('../middlewares/authentication.middleware');

router.all('/:userId*', authenticateToken, userHasAuthorization, usersController.userExists);

// Impact
router.get('/:userId/impact/emissionsAvoided', impactController.getEmissionsAvoidedByUser);

// Activities
router.get('/:userId/activities/', activitiesController.get);
router.get('/:userId/activities/fetchLatest', activitiesController.fetchLatest);
router.get('/:userId/activities/:activityId', activitiesController.activityExists, activitiesController.getOne);
router.put('/:userId/activities/:activityId', activitiesController.activityExists, activitiesController.getOne);

// Base
router.get('/:userId', usersController.getOne);
router.put('/:userId', usersController.update);
router.get('/:userId/onboard', usersController.onboard);
router.delete('/:userId', usersController.remove);

module.exports = router;
