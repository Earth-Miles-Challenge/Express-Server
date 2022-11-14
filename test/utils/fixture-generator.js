const { createUser } = require("../../src/services/users.service");
const { createActivity } = require("../../src/services/activities.service");
const { generateAccessToken } = require('../../src/services/authentication.service');

let platformId = 1;
let platformActivityId = 1;
let emailId = 1;

const generatePlatformId = () => {
	platformId += 1;
	return `${platformId-1}`;
}

const generatePlatformActivityId = () => {
	platformActivityId += 1;
	return `${platformActivityId-1}`;
}

const generateEmail = () => {
	emailId += 1;
	return `test${emailId-1}@user.dev`;
}

const generateNewUser = async (data) => {
	const user = await createUser({
		...{
			first_name: 'Test',
			last_name: 'User',
			email: generateEmail()
		},
		...data
	});

	return user;
}

const getTokenForUser = (user) => {
	const tokenKeys = [ 'id', 'first_name', 'last_name', 'profile_photo', 'activity_platform' ];
	const filteredData = Object.entries(user).filter(([key, value]) => -1 !== tokenKeys.indexOf(key) );
	const tokenData = Object.fromEntries(filteredData);
	return generateAccessToken(tokenData, '2 days');
}

const generateUserActivity = async (user, activityData = {}) => {
	const activity = await createActivity({
		...{
			"activity_platform": "strava",
			"activity_platform_activity_id": generatePlatformActivityId(),
			"activity_type": "run",
			"description": "Evening Run",
			"start_date" : "2018-02-20T18:02:13Z",
			"start_date_local" : "2018-02-20T10:02:13Z",
			"timezone" : "(GMT-08:00) America/Los_Angeles",
			"utc_offset" : -28800,
			"distance": 3000,
			"commute": 0,
			"start_latlng": "",
			"end_latlng": "",
			"emissions_avoided": 576
		},
		...activityData,
		user_id: user.id
	});

	return activity;
};

const generateUserActivities = async (number, user) => {
	let activities = [];
	for (let i = number; i > 0; i--) {
		activities.push(await generateUserActivity(user));
	}
	return activities;
}

module.exports = {
	generatePlatformId,
	generateEmail,
	generateNewUser,
	getTokenForUser,
	generateUserActivity,
	generateUserActivities
}