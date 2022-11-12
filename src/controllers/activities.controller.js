const { authenticateToken } = require('../middlewares/authentication.middleware');

/**
 * Get current user Strava activities.
 *
 * In future, this should be rewritten to /:id/activities.
 */
async function get(req, res, next) {
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
}

module.exports = {
	get
};
