const { getEmissionsAvoidedByUser } = require('../../src/services/impact.service');
const { initializeDatabase } = require('../utils/database');
const { generateNewUser, generateUserActivity, generateUserActivities } = require('../utils/fixture-generator');

beforeAll(() => initializeDatabase().catch(e => console.error(e.stack)));

describe('Impact service', () => {
	describe('getEmissionsAvoidedByUser', () => {
		describe('when user has avoided emissions', () => {
			it('should return total grams avoided', async () => {
				const user = await generateNewUser();
				const activities = 3;
				const emissionsPerActivity = 100;

				await generateUserActivities(activities, user, {co2_avoided_grams: emissionsPerActivity});
				const emissionsSaved = await getEmissionsAvoidedByUser(user.id);
				expect(emissionsSaved).toEqual(activities * emissionsPerActivity)
			});
		});

		describe('when user has not avoided any emissions yet', () => {
			it('should return 0', async () => {
				const user = await generateNewUser();
				await generateUserActivity(user, {co2_avoided_grams: 0});
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