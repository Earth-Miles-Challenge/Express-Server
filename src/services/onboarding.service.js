const onboardStravaUser = (user) => {
	// Get activities from the past 3 months

	// Add all activities to database

	// For each commute activity, calculate the distance of the
	// alternative route via car and calculate emissions avoided
	// based on this distance. Store in separate table.

	/** @todo Later on, also save user clubs */
}

const onboardUser = (userId) => {
	// Get user object, determine platform, then use appropriate onboarder
}


module.exports = {
	onboardStravaUser,
	onboardUser
}