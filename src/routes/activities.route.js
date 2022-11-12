const express = require('express');
const router = express.Router({mergeParams: true});
const activitiesController = require('../controllers/activities.controller');
const { userExists } = require('../controllers/users.controller');
const { authenticateToken } = require('../middlewares/authentication.middleware');

// router.all(authenticateToken, userExists);

router.get('/', activitiesController.get);

// router.get('/:id', authenticateToken, activitiesController.userExists, activitiesController.getOne);

// router.put('/:id', authenticateToken, activitiesController.userExists, activitiesController.update);

module.exports = router;
