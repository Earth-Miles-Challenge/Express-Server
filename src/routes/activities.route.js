nst express = require('express');
const router = express.Router();
const activitiesController = require('../controllers/activities.controller');

router.get('/', activitiesController.get);

router.get('/:id', activitiesController.userExists, activitiesController.getOne);

router.put('/:id', activitiesController.userExists, activitiesController.update);

module.exports = router;
