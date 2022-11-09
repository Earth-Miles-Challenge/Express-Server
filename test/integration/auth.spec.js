const request = require('supertest');
const axios = require('axios');
const app = require('../../app');
const mockAxios = require('../../__mocks__/axios');
const { oAuthTokenResponse } = require('../../__fixtures__/strava');
const { getEnvVariable } = require('../../src/utils/env.utils');
const { generateAccessToken } = require('../../src/services/authentication.service');
const { initializeDatabase, clearDatabase } = require('../utils/database');

beforeAll(() => {
	clearDatabase();
});

beforeEach(() => {
	mockAxios.post.mockClear();
});

describe('GET /auth/strava', () => {
	describe('when code and scope are set and API request succeeds', () => {
		it('should return JWT', async () => {
			mockAxios.post.mockResolvedValueOnce(oAuthTokenResponse);

			const expectedToken = generateAccessToken({
				id: 1,
				first_name: 'Pascal',
				last_name: 'Grant',
				profile_photo: 'pascal.grant',
				activity_platform: 'strava'
			}, '2 days');
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

			expect(res.text).toBe(expectedToken);
			expect(res.statusCode).toBe(200);
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
