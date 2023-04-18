const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/strava', authController.authenticateStrava);
router.post('/login', authController.login);
router.get('/register', authController.register);

module.exports = router;
