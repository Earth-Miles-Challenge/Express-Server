const {
	getActivityImpact,
	createActivityImpact,
	updateActivityImpact,
	deleteActivityImpact,
} = require('../../src/services/activity-impact.service');

const { initializeDatabase } = require('../utils/database');

const {
	generateUserActivity,
	generateUserActivityImpact,
	generateNewUser,
} = require('../utils/fixture-generator');

// beforeEach(async () => await initializeDatabase().catch(e => console.error(e.stack)));

describe('ActivityImpact Service', () => {
	describe('getActivityImpact', () => {
		describe('when getting an existing Activity Impact record', () => {
			it('should return object with Activity Impact details', async () => {
				const data = {
					fossil_alternative_distance: 2000,
					fossil_alternative_polyline: "myPolyline",
					fossil_alternative_co2: 384
				}

				const newActivityImpact = await generateUserActivityImpact(data);
				const activityImpact = await getActivityImpact(newActivityImpact.activity_id);
				expect(activityImpact).toEqual(expect.objectContaining(data));
			});
		});

		describe('when no such activity impact exists', () => {
			it('should return null', async () => {
				const activityImpact = await getActivityImpact(9999);
				expect(activityImpact).toEqual(null);
			});
		});
	})

	describe('createActivityImpact', () => {
		describe('when creating a new activity impact for an existing activity', () => {
			it('should return activity impact data', async () => {
				const user = await generateNewUser();
				const activity = await generateUserActivity(user);
				const data = {
					activity_id: activity.id,
					fossil_alternative_distance: 2000,
					fossil_alternative_polyline: "myPolyline",
					fossil_alternative_co2: 384
				}

				const activityImpact = await createActivityImpact(data);
				expect(activityImpact).toEqual(expect.objectContaining(data));
			});
		});

		describe('when creating a new activity impact for an non-existent activity', () => {
			it('should throw an error', async () => {
				const data = {
					activity_id: 9999,
					fossil_alternative_distance: 2000,
					fossil_alternative_polyline: "myPolyline",
					fossil_alternative_co2: 384
				}
				await expect(createActivityImpact(data))
					.rejects
					.toThrow('insert or update on table "activity_impact" violates foreign key constraint "activity_impact_activity_id_fkey"');
			});
		});

		describe('when any required field is missing', () => {
			it.each([
				'activity_id',
				'fossil_alternative_distance',
				'fossil_alternative_co2',
			])('should throw an error', async (field) => {
				const data = {
					activity_id: 9999,
					fossil_alternative_distance: 2000,
					fossil_alternative_polyline: "myPolyline",
					fossil_alternative_co2: 384
				}
				const baseArray = Object.entries(data);
				const incompleteData = baseArray.filter((val, index) => baseArray[index][0] !== field);
				await expect(createActivityImpact(Object.fromEntries(incompleteData)))
					.rejects
					.toThrow(`Missing required fields: ${field}`);
			});
		});
	})

	xdescribe('updateActivityImpact', () => {
		describe('when updating an activity impact', () => {
			it('should return activity impact data', async () => {
				const activityImpact = await generateUserActivityImpact(user);
				const newData = {
					fossil_alternative_polyline: "myNewPolyline",
				}

				const updatedActivityImpact = await createActivityImpact(activityImpact.activity_id, newData);
				expect(updatedActivityImpact).toEqual(expect.objectContaining(newData));
			});
		});

		describe('when updating a non-existent activity impact', () => {
			it('should throw an error', async () => {
				const user = await generateNewUser();
				const activity = await generateUserActivity(user);
				const data = {
					fossil_alternative_distance: 2000,
					fossil_alternative_polyline: "myPolyline",
					fossil_alternative_co2: 384
				}
				await expect(updateActivityImpact(activity.id, data))
					.rejects
					.toThrow('Activity Impact does not exist.');
			});
		});

		describe('when updating an activity impact with invalid data', () => {
			it('should throw an error', async () => {
				const activityImpact = await generateUserActivityImpact(user);
				const newData = {
					bogus_data: 12391239123,
				}

				await expect(updateActivityImpact(activityImpact.id, newData))
					.rejects
					.toThrow('Unknown column bogus_data passed.');
			});
		});
	});

	describe('deleteActivityImpact', () => {
		describe('when deleting an existing Activity Impact record', () => {
			it('should return 1', async () => {
				const activityImpact = await generateUserActivityImpact();
				const response = await deleteActivityImpact(activityImpact.activity_id);
				expect(response).toEqual(1);
			});
		});

		describe('when no such activity impact exists', () => {
			it('should throw an error', async () => {
				await expect(deleteActivityImpact(9999))
					.rejects
					.toThrow('Activity Impact does not exist.');
			});
		});
	});
});