const parse = require('postgres-date');
const { getFilteredObject } = require("../../src/utils/object.utils");

const getComparisonActivityData = (activityData) => {
	if (!activityData.start_date) return activityData;

	return {
		...activityData,
		// Parse the date the same way pg is going to
		start_date: parse(`${activityData.start_date}Z`)
	}
}

const getComparisonUserData = (userData) => {
	if (!userData.created_at) return userData;

	return {
		...userData,
		// Parse the date the same way pg is going to
		created_at: parse(`${userData.created_at}Z`)
	}
}

const getComparisonStravaConnData = (stravaConnData) => {
	return getFilteredObject(stravaConnData, ([key]) => key !== 'refresh_token');
}

module.exports = {
	getComparisonActivityData,
	getComparisonUserData,
	getComparisonStravaConnData
}