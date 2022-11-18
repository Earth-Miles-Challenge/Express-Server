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

// Base
router.get('/', usersController.get);
router.get('/:userId', usersController.userExists, usersController.getOne);
router.post('/', usersController.create);
router.put('/:userId', usersController.userExists, usersController.update);
router.delete('/:userId', usersController.userExists, usersController.remove);

module.exports = router;
