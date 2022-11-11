// const axios = require('axios');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/strava', authController.authenticateStrava);

module.exports = router;
