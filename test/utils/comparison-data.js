const { getFilteredObject } = require("../../src/utils/object.utils");

const getComparisonActivityData = (activityData) => {
	if (!activityData.start_date) return activityData;

	return {
		...activityData,
		start_date: new Date(activityData.start_date)
	}
}

const getComparisonUserData = (userData) => {
	if (!userData.created_at) return userData;

	return {
		...userData,
		created_at: new Date(userData.created_at)
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