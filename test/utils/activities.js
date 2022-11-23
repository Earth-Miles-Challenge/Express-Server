const getComparisonActivityData = (activityData) => {
	if (!activityData.start_date) return activityData;

	return {
		...activityData,
		start_date: new Date(activityData.start_date)
	}
}

module.exports = {
	getComparisonActivityData
}