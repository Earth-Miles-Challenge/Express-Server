const { createUser } = require("../../src/services/users.service");
const { createActivity } = require("../../src/services/activities.service");
const { createStravaConnection } = require('../../src/services/strava.service');
const { generateAccessToken } = require('../../src/services/authentication.service');
const { createActivityImpact } = require("../../src/services/activity-impact.service");
const { logger } = require("../../src/utils/logger.utils");

let platformId = Math.round(10000 * Math.random());
let platformActivityId = Math.round(10000 * Math.random());
let emailId = Math.round(10000 * Math.random());

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
			"timezone" : "America/Los_Angeles",
			"distance": 3000,
			"start_latlng": "",
			"end_latlng": "",
			"map_polyline": "",
			"commute": false,
			"activity_impact": null
		},
		...activityData,
		user_id: user.id
	});

	return activity;
};

const generateUserActivities = async (number, user, activityData = {}) => {
	let activities = [];
	let date = activityData.start_date ? new Date(activityData.start_date) : new Date('2022-02-12T08:23:21Z');
	for (let i = number; i > 0; i--) {
		date.setDate(date.getDate(date) - 1);
		activities.push(await generateUserActivity(user, {
			...activityData,
			start_date: date.toISOString()
		}));
	}
	return activities;
}

const getStravaConnectionData = (user, connectionData = {}) => {
	return {
		...{
			expires_at: 172800 + parseInt(new Date().getTime() / 1000),
			expires_in: 172800,
			refresh_token: 'myRefreshToken',
			access_token: 'myAccessToken',
			activity_write: true,
			activity_read_all: true,
			profile_read_all: true,
		},
		...connectionData,
		strava_id: user.activity_platform_id,
		user_id: user.id
	};
}

const generateStravaConnectionForUser = async (user, connectionData = {}) => {
	return await createStravaConnection(getStravaConnectionData(user, connectionData));
}

const generateUserActivityImpact = async (activityImpactData = {}, activityUser = null) => {
	const getActivityId = async (activityImpactData, activityUser) => {
		if (activityImpactData.activity_id) return activityImpactData.activity_id;
		const user = activityUser === null
			? await generateNewUser()
			: activityUser;
		const activity = await generateUserActivity(user);
		return activity.id;
	}

	return await createActivityImpact({
		...{
			"activity_id": await getActivityId(activityImpactData, activityUser),
			"fossil_alternative_distance": 3125,
			"fossil_alternative_polyline": "",
			"fossil_alternative_co2": 600,
		},
		...activityImpactData
	})
}

module.exports = {
	generatePlatformId,
	generatePlatformActivityId,
	generateEmail,
	generateNewUser,
	getTokenForUser,
	generateUserActivity,
	generateUserActivities,
	getStravaConnectionData,
	generateStravaConnectionForUser,
	generateUserActivityImpact,
}