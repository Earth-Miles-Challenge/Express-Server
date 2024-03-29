const request = require('supertest');
const axios = require('axios');
const app = require('../../app');
const mockAxios = require('../../__mocks__/axios');
const {
	oAuthTokenResponse
} = require('../../__fixtures__/strava');

const {
	getEnvVariable
} = require('../../src/utils/env.utils');

const {
	verifyAccessToken
} = require('../../src/services/authentication.service');

const {
	getUser
} = require('../../src/services/users.service');

const {
	createStravaConnection,
	getStravaConnection
} = require('../../src/services/strava.service');

const {
	getLastUserId
} = require('../utils/database');

const {
	generateNewUser,
	generatePlatformActivityId,
} = require('../utils/fixture-generator');

const {
	logger
} = require('../../src/utils/logger.utils');

beforeEach(() => mockAxios.post.mockClear());

describe('GET /auth/strava', () => {
	describe('when code and scope are set and API request succeeds', () => {
		it('should make Strava OAuth Token request', async () => {
			mockAxios.post.mockResolvedValue(oAuthTokenResponse);
			const code = '123456';
			await request(app)
				.get(`/api/auth/strava?code=${code}&scope=read,activity:write,activity:read_all,profile:read_all`);

			expect(mockAxios.post).toHaveBeenCalledWith(
				'https://www.strava.com/api/v3/oauth/token',
				{
					client_id: getEnvVariable('STRAVA_CLIENT_ID'),
					client_secret: getEnvVariable('STRAVA_CLIENT_SECRET'),
					code,
					grant_type: 'authorization_code'
				}, {
					headers: { 'Accept-Encoding': 'application/json' }
				}
			);
		});

		it('should have cookie set to token containing user object for new user', async () => {
			mockAxios.post.mockResolvedValue(oAuthTokenResponse);

			const code = '123456';
			const res = await request(app)
				.get(`/api/auth/strava?code=${code}&scope=read,activity:write,activity:read_all,profile:read_all`);

			expect(res.statusCode).toBe(200);

			// Check that the cookie is set
			const cookies = res.headers['set-cookie'];
			expect(cookies).toEqual(expect.objectContaining(/token=.*/));

			// Get the most recently added user
			const expectedUser = {
				id: await getLastUserId()
			};

			// Check that the decoded token has the data we expect
			const token = cookies[0].match(/token=(.*);/)[1]
			const decodedToken = verifyAccessToken(token);
			expect(decodedToken).toEqual(expect.objectContaining(expectedUser));

			// Check that the user exists
			const user = await getUser(decodedToken.id);
			expect(user).toEqual(expect.objectContaining(expectedUser));

			// Check that the Strava connection details exist
			const stravaConn = await getStravaConnection(decodedToken.id);
			expect(stravaConn).not.toBeFalsy();
		});

		it('should have cookie set to token containing user object for updated user', async () => {
			mockAxios.post.mockResolvedValue(oAuthTokenResponse);

			const activityPlatformId = await generatePlatformActivityId();

			const user = await generateNewUser({
				activity_platform: 'strava',
				activity_platform_id: activityPlatformId
			});

			const oldStravaConn = await createStravaConnection({
				user_id: user.id,
				strava_id: activityPlatformId,
				expires_at: 20000000,
				expires_in: 21600,
				refresh_token: 'tobechanged',
				access_token: 'tobechanged',
			});

			const code = '123456';
			const res = await request(app)
				.get(`/api/auth/strava?code=${code}&scope=read,activity:write,activity:read_all,profile:read_all`);

			// Check that the cookie is set
			const cookies = res.headers['set-cookie'];
			expect(cookies).toEqual(expect.objectContaining(/token=.*/));

			// Check that the decoded token has the new Strava details
			const token = cookies[0].match(/token=(.*);/)[1]
			const decodedToken = verifyAccessToken(token);
			const newStravaConn = await getStravaConnection(decodedToken.id);
			expect(newStravaConn).not.toEqual(oldStravaConn);
		});
	});

	describe('when code and scope are set and API request fails', () => {
		it('should return 503 error status response', async () => {
			const error = new Error('Network error from Strava API');
			error.status = 503;

			axios.post.mockRejectedValue(error);

			const code = '123456';
			const res = await request(app)
				.get(`/api/auth/strava?code=${code}&scope=read,activity:write,activity:read_all,profile:read_all`);

			expect(axios.post).toHaveBeenCalledWith(
				'https://www.strava.com/api/v3/oauth/token',
				{
					client_id: getEnvVariable('STRAVA_CLIENT_ID'),
					client_secret: getEnvVariable('STRAVA_CLIENT_SECRET'),
					code,
					grant_type: 'authorization_code'
				}, {
					headers: { 'Accept-Encoding': 'application/json' }
				}
			);

			expect(res.statusCode).toBe(503);
		});
	});

	describe('when code and scope are not set', () => {
		it('should return 400 response', async () => {
			const res = await request(app)
				.get(`/api/auth/strava`);

			expect(res.statusCode).toBe(400);
		});
	});
});
