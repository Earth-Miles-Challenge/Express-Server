const {
	getActivity,
	getMostRecentActivity,
	getActivities,
	createActivity,
	updateActivity
 } = require('../../src/services/activities.service');

const {
	getEmissionsAvoidedByUser,
} = require('../../src/services/impact.service');

const {
	getFilteredObject
} = require('../../src/utils/object.utils');

const {
	getComparisonActivityData
} = require('../utils/comparison-data');

const {
	generatePlatformActivityId,
	generateNewUser,
	generateUserActivity,
	generateUserActivities
} = require('../utils/fixture-generator');

describe('Activities service', () => {
	describe('getActivity', () => {
		describe('when activity exists', () => {
			it('should return activity object', async () => {
				const activityData = {
					"activity_type": "ride",
					"description": "Ride to the shops",
					"commute": true,
				};
				const user = await generateNewUser();
				const { id } = await generateUserActivity(user, activityData);

				await expect(getActivity(id))
					.resolves
					.toEqual(expect.objectContaining(activityData));
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

				await expect(getMostRecentActivity(user.id))
					.resolves
					.toEqual(expect.objectContaining(getComparisonActivityData(secondActivityData)));
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
		describe('when fetching with default arguments', () => {
			it('should return 30 records starting with most recent', async () => {
				const user = await generateNewUser();
				const firstActivity = { "activity_type": "ride", "description": "First Ride", "start_date": "2022-02-22 09:00:00" };
				const defaultActivity = { "activity_type": "ride", "description": "Evening Ride", "start_date": "2022-02-22 10:00:00" };
				const lastActivity = { "activity_type": "ride", "description": "Last Ride", "start_date": "2022-02-22 11:00:00" };

				await generateUserActivity(user, firstActivity);
				await generateUserActivities(30, user, defaultActivity, false);
				await generateUserActivity(user, lastActivity);

				const activities = await getActivities(user.id);

				expect(activities.length).toBe(30);
				expect(activities[0]).toEqual(expect.objectContaining(getComparisonActivityData(lastActivity)));
				expect(activities[29]).toEqual(expect.objectContaining(getComparisonActivityData(defaultActivity)));
			});
		});

		describe('when setting number of records to return', () => {
			it('should return given number of records starting with most recent', async () => {
				const user = await generateNewUser();
				const firstActivity = { "activity_type": "ride", "description": "First Ride", "start_date": "2022-02-22 09:00:00" };
				const defaultActivity = { "activity_type": "ride", "description": "Evening Ride", "start_date": "2022-02-22 10:00:00" };
				const lastActivity = { "activity_type": "ride", "description": "Last Ride", "start_date": "2022-02-22 11:00:00" };

				await generateUserActivity(user, firstActivity);
				await generateUserActivities(10, user, defaultActivity, false);
				await generateUserActivity(user, lastActivity);

				const activities = await getActivities(user.id, {number: 10});

				expect(activities.length).toBe(10);
				expect(activities[0]).toEqual(expect.objectContaining(getComparisonActivityData(lastActivity)));
				expect(activities[9]).toEqual(expect.objectContaining(getComparisonActivityData(defaultActivity)));
			});
		});

		describe('when setting number & page of records to return', () => {
			it('should return given number of records starting with most recent', async () => {
				const user = await generateNewUser();
				const firstActivity = { "activity_type": "ride", "description": "First Ride", "start_date": "2022-02-22 09:00:00" };
				const defaultActivity = { "activity_type": "ride", "description": "Evening Ride", "start_date": "2022-02-22 10:00:00" };
				const lastActivity = { "activity_type": "ride", "description": "Last Ride", "start_date": "2022-02-22 11:00:00" };

				await generateUserActivity(user, firstActivity);
				await generateUserActivities(10, user, defaultActivity, false);
				await generateUserActivity(user, lastActivity);

				const activities = await getActivities(user.id, {number: 6, page: 2});

				expect(activities.length).toBe(6);
				expect(activities[0]).toEqual(expect.objectContaining(getComparisonActivityData(defaultActivity)));
				expect(activities[5]).toEqual(expect.objectContaining(getComparisonActivityData(firstActivity)));
			});
		});

		describe('when there are no activities for user', () => {
			it('should return empty array', async () => {
				const user = await generateNewUser();
				const activities = await getActivities(user.id);

				expect(activities).toEqual([]);
			});
		});
	});

	describe('createActivity', () => {
		describe('when all required fields are provided', () => {
			it('should return object matching inserted data', async () => {
				const user = await generateNewUser();
				const activityData = {
					user_id: user.id,
					activity_type: 'ride',
					activity_platform: 'strava',
					activity_platform_activity_id: '123456789',
					description: 'Ride to the shops',
					start_date: '2022-11-23 12:14:00',
					timezone: 'Australia/Darwin',
					distance: 1723,
					commute: true,
					start_latlng: '',
					end_latlng: '',
					activity_impact: {
						fossil_alternative_distance: 2083,
						fossil_alternative_co2: 400,
						fossil_alternative_polyline: '',
					}
				};
				const activity = await createActivity(activityData);

				expect(activity).toEqual(expect.objectContaining(getComparisonActivityData(activityData)));
			});
		});

		describe('when activity is created with impact', () => {
			it('should update user impact score', async () => {
				const user = await generateNewUser();
				await createActivity({
					user_id: user.id,
					activity_type: 'ride',
					activity_platform: 'strava',
					activity_platform_activity_id: generatePlatformActivityId(),
					description: 'Ride to the shops',
					start_date: '2022-11-23 12:14:00',
					timezone: 'Australia/Darwin',
					distance: 1723,
					commute: true,
					start_latlng: '',
					end_latlng: '',
					activity_impact: {
						fossil_alternative_distance: 2083,
						fossil_alternative_co2: 400,
						fossil_alternative_polyline: '',
					}
				});

				const emissionsSaved = await getEmissionsAvoidedByUser(user.id);
				expect(emissionsSaved).toEqual(400)
			});
		});

		describe('when any required field is missing', () => {
			it.each([
				'user_id',
				'activity_platform',
				'activity_platform_activity_id',
				'activity_type',
				'start_date',
				'timezone',
				'distance'
			])('should throw an error', async (field) => {
				const user = await generateNewUser();
				const activityData = {
					user_id: user.id,
					activity_type: 'ride',
					activity_platform: 'strava',
					activity_platform_activity_id: '123456789',
					description: 'Ride to the shops',
					start_date: '2022-11-23 12:14:00',
					timezone: 'Australia/Darwin',
					distance: 1723,
					commute: true,
					start_latlng: '',
					end_latlng: '',
				};

				const incompleteData = getFilteredObject(activityData, ([key]) => key !== field);

				await expect(createActivity(incompleteData))
					.rejects
					.toThrow(`Missing required fields: ${field}`);
			});
		});

		describe('when invalid activity type is passed', () => {
			it('should throw an error', async () => {
				const user = await generateNewUser();
				const activityData = {
					user_id: user.id,
					activity_type: 'pogostick',
					activity_platform: 'strava',
					activity_platform_activity_id: '123456789',
					description: 'Ride to the shops',
					start_date: '2022-11-23 12:14:00',
					timezone: 'Australia/Darwin',
					distance: 1723,
					commute: true,
					start_latlng: '',
					end_latlng: '',
					activity_impact: null
				};

				await expect(createActivity(activityData))
					.rejects
					.toThrow(`Invalid activity type: pogostick`);
			});
		});

		describe('when invalid activity platform is set', () => {
			it('should throw an error', async () => {
				const user = await generateNewUser();
				const activityData = {
					user_id: user.id,
					activity_type: 'run',
					activity_platform: 'myCustomPlatform',
					activity_platform_activity_id: '123456789',
					description: 'Ride to the shops',
					start_date: '2022-11-23 12:14:00',
					timezone: 'Australia/Darwin',
					distance: 1723,
					commute: true,
					start_latlng: '',
					end_latlng: '',
					activity_impact: null,
				};

				await expect(createActivity(activityData))
					.rejects
					.toThrow(`Invalid activity platform: myCustomPlatform`);
			});
		});

		describe('when activity is created for non-existent user', () => {
			it('should throw an error', async () => {
				const activityData = {
					user_id: 9999,
					activity_type: 'run',
					activity_platform: 'strava',
					activity_platform_activity_id: generatePlatformActivityId(),
					description: 'Ride to the shops',
					start_date: '2022-11-23 12:14:00',
					timezone: 'Australia/Darwin',
					distance: 1723,
					commute: true,
					start_latlng: '',
					end_latlng: '',
				};

				await expect(createActivity(activityData))
					.rejects
					.toThrow("insert or update on table \"activity\" violates foreign key constraint \"activity_user_id_fkey\"");
			});
		});
	});

	describe('updateActivity', () => {
		describe('when updating activity with valid data', () => {
			it('should return activity with updated data', async () => {
				const user = await generateNewUser();
				const { id } = await generateUserActivity(user);
				const activityData = {
					commute: true,
					activity_impact: {
						fossil_alternative_distance: 1041,
						fossil_alternative_co2: 200,
						fossil_alternative_polyline: '',
					}
				};
				const activity = await updateActivity(id, activityData);

				expect(activity).toEqual(expect.objectContaining(activityData));
			});
		});

		describe('when activity is updated with impact', () => {
			it('should update user impact score', async () => {
				const user = await generateNewUser();
				const { id } = await generateUserActivity(user);
				await updateActivity(id, {
					commute: true,
					activity_impact: {
						fossil_alternative_distance: 1041,
						fossil_alternative_co2: 200,
						fossil_alternative_polyline: '',
					}
				});

				const emissionsSaved = await getEmissionsAvoidedByUser(user.id);
				expect(emissionsSaved).toEqual(200)
			});
		});

		describe('when activity is updated with impact set to null', () => {
			it('should update user impact score', async () => {
				const user = await generateNewUser();
				const { id } = await generateUserActivity(user, {
					activity_impact: {
						fossil_alternative_distance: 1041,
						fossil_alternative_co2: 200,
						fossil_alternative_polyline: '',
					}
				});

				await updateActivity(id, {
					commute: true,
					activity_impact: null
				});

				const emissionsSaved = await getEmissionsAvoidedByUser(user.id);
				expect(emissionsSaved).toEqual(0)
			});
		});

		describe('when updating activity that does not exist', () => {
			it('should throw an error', async () => {
				const activityData = {
					commute: true,
				};

				await expect(updateActivity(9999, activityData))
					.rejects
					.toThrow('Activity does not exist.');
			});
		});

		describe('when updating activity with invalid column', () => {
			it('should throw an error', async () => {
				const user = await generateNewUser();
				const { id } = await generateUserActivity(user);
				const activityData = { is_commute: true };
				await expect(updateActivity(id, activityData))
					.rejects
					.toThrow('Unknown column is_commute passed.');
			});
		});
	});
});