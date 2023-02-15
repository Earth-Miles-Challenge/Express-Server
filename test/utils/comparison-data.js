const parse = require('postgres-date');
const { getFilteredObject } = require("../../src/utils/object.utils");

const getComparisonActivityData = (activityData, dateToString = false) => {
	if (!activityData.start_date) return activityData;

	// Parse the date the same way pg is going to
	const date = dateToString ? activityData.start_date.toISOString() : parse(`${activityData.start_date}Z`)

	return {
		...activityData,
		start_date: date
	}
}

const getComparisonUserData = (userData, dateToString = false) => {
	if (!userData.created_at) return userData;

	// Parse the date the same way pg is going to
	const date = dateToString ? userData.created_at.toISOString() : parse(`${userData.created_at}Z`)

	return {
		...userData,
		created_at: date
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