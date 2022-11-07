// const axios = require('axios');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/strava', authController.authenticateStrava);

// router.post('/strava', function(req, res, next) {
// 	if (!req.body.code || req.body.code.length === 0) {
// 		const err = new Error('Missing Strava code');
// 		err.status = 400;
// 		return next(err);
// 	}

// 	response = axios.post(`https://www.strava.com/api/v3/oauth/token`, {
// 		client_id: _clientId,
// 		client_secret: _clientSecret,
// 		code: req.body.code,
// 		grant_type: 'authorization_code'
// 	})
// 	.then((response) => {
// 		res.json(response);
// 	})
// 	.catch((err) => {
// 		next(err);
// 	});
// });

module.exports = router;
