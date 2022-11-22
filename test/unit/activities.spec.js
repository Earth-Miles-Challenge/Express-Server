const {
	getActivity,
	getMostRecentActivity,
	getActivities,
	createActivity,
	getSupportedActivityTypes,
	getSupportedPlatforms
 } = require('../../src/services/activities.service');
const { initializeDatabase } = require('../utils/database');
const { generateNewUser, generateUserActivity, generateUserActivities } = require('../utils/fixture-generator');

beforeAll(() => initializeDatabase().catch(e => console.error(e.stack)));

describe('Activities service', () => {
	describe('getActivity', () => {
		describe('when activity exists', () => {
			it('should return activity object', async () => {
				const activityData = {
					"activity_type": "ride",
					"description": "Ride to the shops",
					"commute": true,
					"co2_avoided_grams": 400
				};
				const user = await generateNewUser();
				const { id } = await generateUserActivity(user, activityData);
				const activity = await getActivity(id);
				expect(activity).toEqual(expect.objectContaining(activityData));
			});

			it('should have returned date as correct Javascript Date object', async () => {
				const activityData = {
					"start_date": "2022-11-06T09:00:00Z",
				}
				const user = await generateNewUser();
				const { id } = await generateUserActivity(user, activityData);
				const activity = await getActivity(id);

				expect(activity.start_date.getUTCDate()).toEqual(6);
				expect(activity.start_date.getUTCHours()).toEqual(9);
				expect(activity.start_date.getUTCMinutes()).toEqual(0);
			});

			it('should be able to get local date & time', async () => {
				const activityData = {
					"start_date": "2017-09-06T22:48:15Z",
					"timezone": "Australia/Darwin",
				};
				const user = await generateNewUser();
				const { id } = await generateUserActivity(user, activityData);
				const activity = await getActivity(id);

				expect(activity.start_date.toLocaleString('en-au', {timeZone: activity.timezone}))
					.toBe('07/09/2017, 8:18:15 am');
			});
		});

		describe('when activity does not exist', () => {
			it('should return null', async () => {
				const activity = await getActivity(9999);
				expect(activity).toBe(null);
			});
		});
	});

	describe('getMostRecentActivity', () => {
		describe('when user has activities', () => {
			it('should return the most recent one', async () => {
				const user = await generateNewUser();
				const firstActivityData = {
					"activity_type": "run",
					"description": "First run",
					"start_date": "2022-11-06T09:00:00Z",
				}
				const secondActivityData = {
					"activity_type": "ride",
					"description": "Second ride",
					"start_date": "2022-11-22T09:00:00Z",
				}

				await generateUserActivity(user, firstActivityData);
				await generateUserActivity(user, secondActivityData);

				await generateUserActivity(user, {
					"description": "School to home",
					"start_date": "2017-09-06T22:48:15Z",
				});

				const activity = await getMostRecentActivity(user.id);

				expect(JSON.parse(JSON.stringify(activity))).toEqual(expect.objectContaining({
					activity_type: secondActivityData.activity_type,
					description: secondActivityData.description
				}));
			});
		});

		describe('when user does not have activities', () => {
			it('should return null', async () => {
				const user = await generateNewUser();
				const activity = await getMostRecentActivity(user.id);
				expect(activity).toBe(null);
			});
		});
	});

	describe('getActivities', () => {

	});

	describe('createActivity', () => {

	});

	describe('getSupportedActivityTypes', () => {

	});

	describe('getSupportedPlatforms', () => {

	});


	xdescribe('getEmissionsAvoidedByUser', () => {
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