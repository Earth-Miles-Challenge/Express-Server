const {
	getEmissionsAvoidedByUser
} = require('../../src/services/impact.service');
const { logger } = require('../../src/utils/logger.utils');

const {
	generateNewUser,
	generateUserActivity,
	generateUserActivities,
	generateUserActivityImpact
} = require('../utils/fixture-generator');

describe('Impact service', () => {
	describe('getEmissionsAvoidedByUser', () => {
		describe('when user has avoided emissions', () => {
			it('should return total grams avoided', async () => {
				const user = await generateNewUser();
				const numberOfActivities = 3;
				const emissionsPerActivity = 100;
				const activities = await generateUserActivities(numberOfActivities, user);
				await Promise.all(
					activities.map(activity => {
						return generateUserActivityImpact(
							{
								activity_id: activity.id,
								fossil_alternative_distance: 520,
								fossil_alternative_co2: emissionsPerActivity
							}
						)
					})
				);

				const emissionsSaved = await getEmissionsAvoidedByUser(user.id);
				expect(emissionsSaved).toEqual(numberOfActivities * emissionsPerActivity)
			});
		});

		describe('when user has not avoided any emissions yet', () => {
			it('should return 0', async () => {
				const user = await generateNewUser();
				await generateUserActivity(user);
				const emissionsSaved = await getEmissionsAvoidedByUser(user.id);
				expect(emissionsSaved).toEqual(0);
			});
		});

		describe('when no activities found for user', () => {
			it('should return 0', async () => {
				const user = await generateNewUser();
				const emissionsSaved = await getEmissionsAvoidedByUser(user.id);
				expect(emissionsSaved).toEqual(0);
			});
		});
	});
});