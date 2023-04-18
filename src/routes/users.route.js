const express = require('express');
const router = express.Router();
const passport = require('passport');
const usersController = require('../controllers/users.controller');
const activitiesController = require('../controllers/activities.controller');
const impactController = require('../controllers/impact.controller');
const { userHasAuthorization } = require('../middlewares/authentication.middleware');

router.all('/:userId*', passport.authenticate('jwt', { session: false }), userHasAuthorization, usersController.userExists);

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
router.delete('/:userId', usersController.remove);

module.exports = router;
