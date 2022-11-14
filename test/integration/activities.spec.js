const request = require('supertest');
const app = require('../../app');
const { initializeDatabase } = require('../utils/database');
const {
	generatePlatformId,
	generateNewUser,
	getTokenForUser,
	generateUserActivity,
	generateUserActivities
} = require('../utils/fixture-generator');

beforeAll(() => initializeDatabase().catch(e => console.error(e.stack)));

describe('/users/:id/activities route', () => {
	describe('GET /users/:id/activities', () => {
		describe('when fetching activities for existing user', () => {
			it('should return a list of 20 activities by default', async () => {
				const user = await generateNewUser({
					activity_platform: 'strava',
					activity_platform_id: generatePlatformId()
				});
				const token = getTokenForUser(user);

				const activities = await generateUserActivities(25, user);

				const res = await request(app)
					.get(`/users/${user.id}/activities`)
					.set('Authorization', 'Bearer ' + token);

				expect(res.statusCode).toBe(200);
				expect(res.body.length).toBe(20);
				expect(res.body[0]).toEqual(expect.objectContaining(JSON.parse(JSON.stringify(activities[0]))));
				expect(res.body[19]).toEqual(expect.objectContaining(JSON.parse(JSON.stringify(activities[19]))));
			});

			it('should return set number of activies when specified', async () => {
				const user = await generateNewUser({
					activity_platform: 'strava',
					activity_platform_id: generatePlatformId()
				});

				const token = getTokenForUser(user);
				const expectedNumber = 10;

				const activities = await generateUserActivities(25, user);

				const res = await request(app)
					.get(`/users/${user.id}/activities?number=${expectedNumber}`)
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
					.get('/users/1/activities');

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
					.get(`/users/${user.id + 1}/activities`)
					.set('Authorization', `Bearer ${token}`);

				expect(res.statusCode).toBe(403);
			});
		});

		// Skipping this test for now since users can only request for themselves
		// and the token validation means their user should exist
		xdescribe('when fetching activities for non-existing user', () => {
			it('should return 404', async () => {
				const res = await request(app)
					.get('/users/9999/activities')
					.set('Authorization', 'Bearer ' + token);

				expect(res.statusCode).toBe(404);
			});
		});
	});
});