const request = require('supertest');
const app = require('../../app');
const { logger } = require('../../src/utils/logger.utils');
const { initializeDatabase } = require('../utils/database');
const {
	generatePlatformId,
	generateNewUser,
	getTokenForUser,
	generateUserActivity,
	generateUserActivities
} = require('../utils/fixture-generator');

// beforeEach(async () => await initializeDatabase().catch(e => console.error(e.stack)));

describe('/users/:id/activities route', () => {
	describe('GET /users/:id/activities', () => {
		describe('when fetching activities for existing user', () => {
			it('should return a list of 30 activities by default', async () => {
				const user = await generateNewUser({
					activity_platform: 'strava',
					activity_platform_id: generatePlatformId()
				});
				const token = getTokenForUser(user);

				const activities = await generateUserActivities(35, user);

				const res = await request(app)
					.get(`/api/users/${user.id}/activities`)
					.set('Authorization', 'Bearer ' + token);

				expect(res.statusCode).toBe(200);
				expect(res.body.length).toBe(30);
				expect(res.body[0]).toEqual(expect.objectContaining(JSON.parse(JSON.stringify(activities[0]))));
				expect(res.body[29]).toEqual(expect.objectContaining(JSON.parse(JSON.stringify(activities[29]))));
			});

			it('should return set number of activies when specified', async () => {
				const user = await generateNewUser({
					activity_platform: 'strava',
					activity_platform_id: generatePlatformId()
				});

				const token = getTokenForUser(user);

				const earlyCheck = await request(app)
					.get(`/api/users/${user.id}/activities`)
					.set('Authorization', 'Bearer ' + token);

				expect(earlyCheck.statusCode).toBe(200);
				expect(earlyCheck.body.length).toBe(0);

				const expectedNumber = 10;

				const activities = await generateUserActivities(25, user);

				const res = await request(app)
					.get(`/api/users/${user.id}/activities?number=${expectedNumber}`)
					.set('Authorization', 'Bearer ' + token);

				expect(res.statusCode).toBe(200);
				expect(res.body.length).toBe(expectedNumber);
				expect(res.body[0]).toEqual(expect.objectContaining(JSON.parse(JSON.stringify(activities[0]))));
				expect(res.body[9]).toEqual(expect.objectContaining(JSON.parse(JSON.stringify(activities[9]))));
			});
		});

		describe('when making request without token set', () => {
			it('should return a 401 response', async () => {
				const res = await request(app)
					.get('/api/users/1/activities');

				expect(res.statusCode).toBe(401);
			});
		});

		describe('when making request without resource authorization', () => {
			it('should return a 403 response', async () => {
				const user = await generateNewUser({
					activity_platform: 'strava',
					activity_platform_id: generatePlatformId()
				});
				const token = getTokenForUser(user);

				const res = await request(app)
					.get(`/api/users/${user.id + 1}/activities`)
					.set('Authorization', `Bearer ${token}`);

				expect(res.statusCode).toBe(403);
			});
		});

		// Skipping this test for now since users can only request for themselves
		// and the token validation means their user should exist
		xdescribe('when fetching activities for non-existing user', () => {
			it('should return 404', async () => {
				const res = await request(app)
					.get('/api/users/9999/activities')
					.set('Authorization', 'Bearer ' + token);

				expect(res.statusCode).toBe(404);
			});
		});
	});

	describe('GET /users/:id/activities/:activityId', () => {
		describe('when fetching an existing activity with required authorization', () => {
			it('should return 200', async() => {
				const user = await generateNewUser({
					activity_platform: 'strava',
					activity_platform_id: generatePlatformId()
				});

				const token = getTokenForUser(user);
				const expectedData = {
					"activity_type": "ride",
					"description": "Ride to work",
					"distance": 6000,
					"emissions_avoided": 1152
				}

				const activity = await generateUserActivity(user, expectedData);
				const res = await request(app)
					.get(`/api/users/${user.id}/activities/${activity.id}`)
					.set('Authorization', `Bearer ${token}`);

				expect(res.statusCode).toBe(200);
				expect(res.body).toEqual(expect.objectContaining(JSON.parse(JSON.stringify(activity))))
			});
		});
	});

	describe('PUT /users/:id/activities/:activityId', () => {
		describe('when updating an existing activity with required authorization', () => {
			it('should return 200', async() => {
				const user = await generateNewUser({
					activity_platform: 'strava',
					activity_platform_id: generatePlatformId()
				});

				const token = getTokenForUser(user);
				const initialData = {
					"activity_type": "ride",
					"description": "Ride to work",
					"commute": false
				}

				const activity = await generateUserActivity(user, initialData);

				const updateData = {
					"commute": true
				};

				const res = await request(app)
					.put(`/api/users/${user.id}/activities/${activity.id}`)
					.set('Authorization', `Bearer ${token}`)
					.send(updateData);

				const expectedData = {
					...initialData,
					...updateData
				}

				expect(res.statusCode).toBe(200);
				expect(res.body).toEqual(expect.objectContaining(JSON.parse(JSON.stringify(expectedData))))
			});
		});
	});
});