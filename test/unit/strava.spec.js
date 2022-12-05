const mockAxios = require('../../__mocks__/axios');
const stravaMocks = require('../../__fixtures__/strava');
const db = require('../../src/services/database.service');

const {
	getStravaConnection,
	createStravaConnection,
	updateStravaConnection,
	deleteStravaConnection,
	getClientToken,
	getUserAccessToken,
	getAthleteActivities,
	createActivityFromStravaActivity,
	parseTimezone,
	parseScope
} = require('../../src/services/strava.service');

const {
	generateNewUser,
	generatePlatformId,
	getStravaConnectionData,
	generateStravaConnectionForUser
} = require('../utils/fixture-generator');

const {
	getComparisonStravaConnData
} = require('../utils/comparison-data');

const {
	logger
} = require('../../src/utils/logger.utils');

describe('Strava service', () => {
	describe('getStravaConnection', () => {
		describe('when called for user with connection', () => {
			it('should return connection details', async () => {
				const user = await generateNewUser({
					activity_platform: 'strava',
					activity_platform_id: generatePlatformId()
				});
				const expectedConnection = await generateStravaConnectionForUser(user);
				const retrievedConnection = await getStravaConnection(user.id);
				expect(retrievedConnection).toEqual(expect.objectContaining(expectedConnection));
			});
		});

		describe('when called for user with no connection', () => {
			it('should return null', async () => {
				const user = await generateNewUser();
				const retrievedConnection = await getStravaConnection(user.id);
				expect(retrievedConnection).toBe(null);
			});
		});
	});

	describe('createStravaConnection', () => {
		describe('when called with all required values', () => {
			it('should return object', async () => {
				const user = await generateNewUser();
				const stravaConnData = getStravaConnectionData(user);
				const stravaConn = await createStravaConnection(stravaConnData);
				expect(stravaConn).toEqual(expect.objectContaining(getComparisonStravaConnData(stravaConnData)));
			});
		});

		describe('when called for non-existent user', () => {
			it('should throw an error', async () => {
				const stravaConnData = getStravaConnectionData({id:9999, strava_id:'abc123'});
				await expect(createStravaConnection(stravaConnData))
					.rejects
					.toThrow();
			});
		});
	});

	describe('updateStravaConnection', () => {
		describe('when updating existing connection', () => {
			it('should return updated connection data', async () => {
				const user = await generateNewUser();
				await generateStravaConnectionForUser(user);
				const updateData = {
					access_token: 'myNewAccessToken',
					expires_at: parseInt(new Date().getTime() / 1000) + 10
				}
				const stravaConn = await updateStravaConnection(user.id, updateData);
				expect(stravaConn).toEqual(expect.objectContaining(updateData));
			});
		});

		describe('when updating existing connection with new refresh token', () => {
			it('should return updated connection data', async () => {
				const user = await generateNewUser();
				await generateStravaConnectionForUser(user);
				const updateData = {
					access_token: 'myNewAccessToken',
					expires_at: parseInt(new Date().getTime() / 1000) + 10,
					refresh_token: 'myNewRefreshToken'
				}
				const stravaConn = await updateStravaConnection(user.id, updateData);
				expect(stravaConn).toEqual(expect.objectContaining(getComparisonStravaConnData(updateData)));
			});
		});

		describe('when updating connection for deleted user', () => {
			it('should throw an error', async () => {
				const user = await generateNewUser();
				await generateStravaConnectionForUser(user);

				// Delete the user
				db.query(`DELETE FROM user_account WHERE id = $1`, [user.id]);

				const updateData = {
					access_token: 'myNewAccessToken',
					expires_at: parseInt(new Date().getTime() / 1000) + 10
				}

				await expect(updateStravaConnection(user.id, updateData))
					.rejects
					.toThrow('Strava connection for user does not exist.');
			});

			describe('when updating connection user who does not already have one', () => {
				it('should throw an error', async () => {
					const user = await generateNewUser();
					const updateData = {
						access_token: 'myNewAccessToken',
						expires_at: parseInt(new Date().getTime() / 1000) + 10
					};
					await expect(updateStravaConnection(user.id, updateData))
						.rejects
						.toThrow('Strava connection for user does not exist.');
				});
			});
		});
	});

	describe('deleteStravaConnection', () => {
		describe('when deleting an existing Strava connection', () => {
			it('should return 1', async () => {
				const user = await generateNewUser();
				await generateStravaConnectionForUser(user);
				const response = await deleteStravaConnection(user.id);
				expect(response).toEqual(1);
			});
		});

		describe('when deleting non-existing Strava connection', () => {
			it('should throw an error', async () => {
				const user = await generateNewUser();
				await expect(deleteStravaConnection(user.id))
					.rejects
					.toThrow('Strava connection for user does not exist.');
			});
		});
	});

	describe('getClientToken', () => {
		describe('when Strava returns successfully', () => {
			it('should return data', async () => {
				mockAxios.post.mockResolvedValue(stravaMocks.oAuthTokenResponse);
				const response = await getClientToken('abc');
				expect(response).toEqual(expect.objectContaining(stravaMocks.oAuthTokenResponse.data));
			});
		});

		describe('when Strava returns error', () => {
			it('should throw an error', async () => {
				mockAxios.post.mockRejectedValueOnce(new Error('Strava error'));
				await expect(getClientToken('abc'))
					.rejects
					.toThrow('Strava error');
			});
		});
	});

	describe('getUserAccessToken', () => {
		describe('when access token is still valid', () => {
			it('should return existing access token', async () => {
				const user = await generateNewUser();
				const originalStravaConn = await generateStravaConnectionForUser(user);
				const { accessToken, stravaConn } = await getUserAccessToken(user.id);

				expect(accessToken).toBe(originalStravaConn.access_token);
				expect(stravaConn).toEqual(expect.objectContaining(originalStravaConn));
			});
		});

		describe('when access token has expired', () => {
			it('should return a new access token', async () => {
				mockAxios.post.mockResolvedValue(stravaMocks.oAuthTokenResponse);
				const user = await generateNewUser();
				const originalStravaConn = await generateStravaConnectionForUser(user, {
					expires_at: parseInt(new Date().getTime() / 1000) - 1000,
					expires_in: 0,
				});
				const { accessToken, stravaConn } = await getUserAccessToken(user.id);

				expect(accessToken).toBe(stravaMocks.oAuthTokenResponse.data.access_token);
				expect(accessToken).not.toBe(originalStravaConn.access_token);
				expect(stravaConn).not.toEqual(expect.objectContaining(originalStravaConn));
			});
		});
	});

	xdescribe('getAthleteActivities', () => {
		describe('when ...', () => {
			it('should ...', async () => {
				mockAxios.get.mockResolvedValue(stravaMocks.oAuthTokenResponse);
				expect(false).toBeTruthy();
			});
		});
	});

	xdescribe('createActivityFromStravaActivity', () => {
		describe('when ...', () => {
			it('should ...', async () => {
				expect(false).toBeTruthy();
			});
		});
	});

	describe('parseTimezone', () => {
		describe('when parsing timezone received from Strava', () => {
			it('should return region without the UTC offset', () => {
				const timezone = '(GMT+09:30) Australia/Darwin';
				const expected = 'Australia/Darwin';
				expect(parseTimezone(timezone)).toBe(expected);
			});
		});
	});

	describe('parseScope', () => {
		describe('when parsing full string of scope', () => {
			it('should return array containing all scopes set to true', () => {
				const scope = 'read,activity:write,activity:read_all,profile:read_all';
				const expected = {
					'activity_write': true,
					'activity_read_all': true,
					'profile_read_all': true
				};
				expect(parseScope(scope)).toEqual(expect.objectContaining(expected))
			});
		});

		describe('when some scopes were not granted', () => {
			test.each([
				[
					'read,activity:write,activity:read_all',
					{ 'activity_write': true, 'activity_read_all': true, 'profile_read_all': false }
				],
				[
					'read,activity:write,profile:read_all',
					{ 'activity_write': true, 'activity_read_all': false, 'profile_read_all': true }
				],
				[
					'read,activity:write',
					{ 'activity_write': true, 'activity_read_all': false, 'profile_read_all': false }
				],
				[
					'read',
					{ 'activity_write': false, 'activity_read_all': false, 'profile_read_all': false }
				],
			])('should return array containing grant scopes with true/false values', (scope, expected) => {
				expect(parseScope(scope)).toEqual(expect.objectContaining(expected))
			});
		});
	});
});