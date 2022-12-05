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
	const filteredData = Object.entries(stravaConnData).filter(([key]) => key !== 'refresh_token');
	return Object.fromEntries(filteredData);
}

module.exports = {
	getComparisonActivityData,
	getComparisonUserData,
	getComparisonStravaConnData
}