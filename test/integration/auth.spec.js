const request = require('supertest');
const axios = require('axios');
const app = require('../../app');
const mockAxios = require('../../__mocks__/axios');
const { oAuthTokenResponse } = require('../../__fixtures__/strava');
const { getEnvVariable } = require('../../src/utils/env.utils');
const { generateAccessToken, verifyAccessToken } = require('../../src/services/authentication.service');
const { initializeDatabase, getNextUserId } = require('../utils/database');

// beforeAll(() => initializeDatabase());
// afterAll(() => clearDatabase());
beforeAll(() => initializeDatabase().catch(e => console.error(e.stack)));
beforeEach(() => mockAxios.post.mockClear());

describe('GET /auth/strava', () => {
	describe('when code and scope are set and API request succeeds', () => {
		it('should return JWT', async () => {
			mockAxios.post.mockResolvedValueOnce(oAuthTokenResponse);

			const expectedUser = {
				first_name: oAuthTokenResponse.data.athlete.firstname,
				last_name: oAuthTokenResponse.data.athlete.lastname,
				profile_photo: oAuthTokenResponse.data.athlete.profile,
				activity_platform: 'strava'
			};

			const code = '123456';
			const res = await request(app)
				.get(`/auth/strava?code=${code}&scope=read,activity:write,activity:read_all,profile:read_all`);

			expect(mockAxios.post).toHaveBeenCalledWith(
				'https://www.strava.com/api/v3/oauth/token',
				{
					client_id: getEnvVariable('STRAVA_CLIENT_ID'),
					client_secret: getEnvVariable('STRAVA_CLIENT_SECRET'),
					code,
					grant_type: 'authorization_code'
				}
			);

			expect(res.statusCode).toBe(200);

			// Check that the decoded token has the data we expect
			const decodedToken = verifyAccessToken(res.text);
			expect(decodedToken).toEqual(expect.objectContaining(expectedUser));
		});
	});

	describe('when code and scope are set and API request fails', () => {
		it('should return 503 error status response', async () => {
			const error = new Error('Network error from Strava API');
			error.status = 503;

			axios.post.mockRejectedValueOnce(error);

			const code = '123456';
			const res = await request(app)
				.get(`/auth/strava?code=${code}&scope=read,activity:write,activity:read_all,profile:read_all`);

			expect(axios.post).toHaveBeenCalledWith(
				'https://www.strava.com/api/v3/oauth/token',
				{
					client_id: getEnvVariable('STRAVA_CLIENT_ID'),
					client_secret: getEnvVariable('STRAVA_CLIENT_SECRET'),
					code,
					grant_type: 'authorization_code'
				}
			);

			expect(res.statusCode).toBe(503);
		});
	});

	describe('when code and scope are not set', () => {
		it('should return 400 response', async () => {
			const res = await request(app)
				.get(`/auth/strava`);

			expect(res.statusCode).toBe(400);
		});
	});
});
