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
	res.json(
		[
			{
				"id": 132,
				"activity_type": "run",
				"description": "Evening Run",
				"start_date" : "2018-02-20T18:02:13Z",
				"start_date_local" : "2018-02-20T10:02:13Z",
				"timezone" : "(GMT-08:00) America/Los_Angeles",
				"utc_offset" : -28800,
				"distance": 2483,
				"commute": 0,
				"start_latlng": "",
				"end_latlng": "",
				"emissions_avoided": 0
			},
			{
				"id": 139,
				"activity_type": "ride",
				"description": "Ride to work",
				"start_date" : "2022-03-01T18:02:13Z",
				"start_date_local" : "2022-03-01T10:02:13Z",
				"timezone" : "(GMT-08:00) America/Los_Angeles",
				"utc_offset" : -28800,
				"distance": 2483,
				"commute": 1,
				"start_latlng": "",
				"end_latlng": "",
				"co2_avoided_grams": 425
			},
			{
				"id": 162,
				"activity_type": "ride",
				"description": "Ride home via shop",
				"start_date" : "2022-03-04T18:02:13Z",
				"start_date_local" : "2022-03-04T10:02:13Z",
				"timezone" : "(GMT-08:00) America/Los_Angeles",
				"utc_offset" : -28800,
				"distance": 3290,
				"commute": 1,
				"start_latlng": "",
				"end_latlng": "",
				"co2_avoided_grams": 563
			}
		]
	);
	// console.log(req.session);
	// if (req.session.strava) {
	// 	const activities = getAthleteActivities(req.session.strava.access_token)
	// 	res.json(activities);
	// } else {
	// 	res.json([]);
	// }
});


module.exports = router;
