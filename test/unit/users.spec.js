const { createUser, getUser, getUserByPlatformId, getUsers, updateUser, deleteUser } = require('../../src/services/users.service');
const { initializeDatabase, clearDatabase } = require('../utils/database');

beforeEach(initializeDatabase);
afterEach(clearDatabase);

describe('Users service', () => {
	describe('getUser', () => {
		describe('when called with ID of existing user', () => {
			it('should return user object', async () => {
				const expectedUser = {
					'first_name': 'Delmy',
					'last_name': 'Hamilton',
					'email': 'staffing2025@outlook.com'
				};

				const user = await getUser(1);

				expect(user).toEqual(expect.objectContaining(expectedUser));
			});
		});

		describe('when called with ID not belong to any user', () => {
			it('should return falsy value', async () => {
				const user = await getUser(9999);

				expect(user).toBeFalsy();
			});
		});
	});

	describe('getUserByPlatformId', () => {
		describe('when called with platform ID of existing user', () => {
			it('should return user object', async () => {
				const userData = {
					first_name: 'Test',
					last_name: 'User',
					email: 'test.user@ex.dev',
					activity_platform_id: '11111',
					activity_platform: 'strava'
				}

				const res = await createUser(userData);
				const user = await getUserByPlatformId('strava', '11111');
				expect(user).toEqual(expect.objectContaining(userData));
			});
		});

		describe('when called with platform ID not belong to any user', () => {
			it('should return falsy value', async () => {
				const user = await getUserByPlatformId('strava', '00000');

				expect(user).toBeFalsy();
			});
		});
	});

	describe('createUser', () => {
		describe('when called with all values', () => {
			it('should create a new user', async () => {
				const res = await createUser({
					first_name: 'Test',
					last_name: 'User',
					email: 'test.user@ex.dev',
					profile_photo: 'https://localhost:9000/user-profile-image.jpg',
					activity_platform_id: '11111',
					activity_platform: 'strava'
				});

				expect(res).toHaveProperty('id');
				expect(res.id).toBeGreaterThanOrEqual(1);
			});
		});

		describe('when called without an email address but with an activity platform ID', () => {
			it('should create a new user', async () => {
				const res = await createUser({
					first_name: 'Test',
					last_name: 'User',
					activity_platform_id: '11111',
					activity_platform: 'strava'
				});

				expect(res).toHaveProperty('id');
				expect(res.id).toBeGreaterThanOrEqual(1);
			});
		});

		describe('when called with an email address but no activity platform ID', () => {
			it('should create a new user', async () => {
				const res = await createUser({
					first_name: 'Test',
					last_name: 'User',
					email: 'test@user.dev'
				});

				expect(res).toHaveProperty('id');
				expect(res.id).toBeGreaterThanOrEqual(1);
			});
		});

		describe('when called without an email or platform ID', () => {
			it('should throw an error', async () => {
				await expect(
					createUser({
						first_name: 'Test',
						last_name: 'User'
					})
				)
				.rejects
				.toThrow(new Error('User requires either an email address or an activity platform ID.'));
			});
		});

		describe('when called with platform ID but no platform', () => {
			it('should throw an error', async () => {
				await expect(
					createUser({
						first_name: 'Test',
						last_name: 'User',
						email: 'test@user.dev',
						activity_platform_id: '11111'
					})
				)
				.rejects
				.toThrow(new Error('User requires activity platform when setting activity platform ID.'));
			});
		});

		describe('when called with platform but no platform ID', () => {
			it('should throw an error', async () => {
				await expect(
					createUser({
						first_name: 'Test',
						last_name: 'User',
						email: 'test@user.dev',
						activity_platform: 'strava'
					})
				)
				.rejects
				.toThrow(new Error('User requires activity platform ID when setting activity platform.'));
			});
		});
	});
});
