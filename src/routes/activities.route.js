const express = require('express');
const router = express.Router({mergeParams: true});
const activitiesController = require('../controllers/activities.controller');
const { userExists } = require('../controllers/users.controller');
const { authenticateToken, userHasAuthorization } = require('../middlewares/authentication.middleware');

// When a request is made, the token must be set as the authorization.
// -- If not set, will return 401. If set but invalid, will return 403.
// The user must have authorization for the request.
// -- If the user does not have authorization, return 403.
// The requested user does not exist.
// -- If user does not exist, return 404
// Otherwise, proceed to individual request handler.

router.all('*', authenticateToken, userHasAuthorization, userExists);

router.get('/', activitiesController.get);

router.get('/fetchLatest', activitiesController.fetchLatest);

router.get('/:activityId', activitiesController.activityExists, activitiesController.getOne);

module.exports = router;
