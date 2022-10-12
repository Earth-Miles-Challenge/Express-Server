const express = require('express');
const router = express.Router();
const { getAthleteActivities } = require('../utils/strava');

const ATHLETES = [
	{
		id: 1,
		profile: {
			name: 'Phil Coulson',
			email: 'phil@shield.dev',
			picture: '',
			strava_id: '123123123'
		},
		stravaConnection: {
			expires_at: '',
			expires_in: '',
			refresh_token: '',
			access_token: ''
		}
	},
	{
		id: 2,
		profile: {
			name: 'Melinda May',
			email: 'may@shield.dev',
			picture: '',
			strava_id: '123123123'
		},
		stravaConnection: {
			expires_at: '',
			expires_in: '',
			refresh_token: '',
			access_token: ''
		}
	},
	{
		id: 3,
		profile: {
			name: 'Gemma Simmons',
			email: 'g.simmons@shield.dev',
			picture: '',
			strava_id: '123123123'
		},
		stravaConnection: {
			expires_at: '',
			expires_in: '',
			refresh_token: '',
			access_token: ''
		}
	}
]

/**
 * Get athletes, optionally filtered by search.
 */
router.get('/', function(req, res, next) {
	const getAthletes = () => {
		const search = req.query.search || '';
		if (search.length) {
			return ATHLETES.filter(athlete => athlete.profile.name.toLowerCase().includes(search.toLowerCase()))
		} else {
			return ATHLETES
		}
	}

	res.json(getAthletes());
});

/**
 * Get current user profile.
 */
router.get('/profile', (req, res, next) => {
	if (req.session.profile) {
		res.json(req.session.profile);
	} else {
		res.json({});
	}
});

/**
 * Get current user Strava activities.
 *
 * In future, this should be rewritten to /:id/activities.
 */
router.get('/activities', (req, res, next) => {
	res.json([]);
	// console.log(req.session);
	// if (req.session.strava) {
	// 	const activities = getAthleteActivities(req.session.strava.access_token)
	// 	res.json(activities);
	// } else {
	// 	res.json([]);
	// }
});


module.exports = router;
