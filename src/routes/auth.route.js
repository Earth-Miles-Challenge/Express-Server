const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { validateStravaAuthenticationRequest } = require('../middlewares/authentication.middleware');
const { checkValidation } = require('../middlewares/validator.middleware');

router.get('/strava', validateStravaAuthenticationRequest, authController.authenticateStrava);
router.post('/login', authController.login);
router.post('/register',
	body('email').isEmail(),
	body('password').notEmpty(),
	checkValidation,
	authController.register
);

module.exports = router;
