const { createUser, getUser, getUserByPlatformId, getUsers, updateUser, deleteUser } = require('../../src/services/users.service');
const { initializeDatabase, clearDatabase } = require('../utils/database');

beforeEach(initializeDatabase);
afterEach(clearDatabase);

describe('Users service', () => {
	describe('getUsers', () => {
		describe('when called without arguments', () => {
			it('should return an array with 20 objects', async () => {
				const users = await getUsers();
				expect(users.length).toBe(20);
			});

			it('should start with Delmy Hamilton', async () => {
				const expectedUser = {
					'first_name': 'Delmy',
					'last_name': 'Hamilton',
					'email': 'staffing2025@outlook.com'
				};
				const users = await getUsers();
				expect(users[0]).toEqual(expect.objectContaining(expectedUser));
			});

			it('should end with Desirae Nash', async () => {
				const expectedUser = {
					'first_name': 'Desirae',
					'last_name': 'Nash',
					'email': 'missed2061@yandex.com'
				};
				const users = await getUsers();
				expect(users[19]).toEqual(expect.objectContaining(expectedUser));
			});
		});

		describe('when called with number 7 and page 2', () => {
			it('should return an array with 7 objects', async () => {
				const users = await getUsers({number: 7, page: 2});
				expect(users.length).toEqual(7);
			});

			it('should start with France McDonald', async () => {
				const expectedUser = {
					'first_name': 'France',
					'last_name': 'Macdonald',
					'email': 'glasses1813@protonmail.com'
				  };
				const users = await getUsers({number: 7, page: 2});
				expect(users[0]).toEqual(expect.objectContaining(expectedUser));
			});
			it('should end with Fausto Berger', async () => {
				const expectedUser = {
					'first_name': 'Fausto',
					'last_name': 'Berger',
					'email': 'orlando1910@live.com'
				};
				const users = await getUsers({number: 7, page: 2});
				expect(users[6]).toEqual(expect.objectContaining(expectedUser));
			});
		});

		describe('when called with number 10 and page 100', () => {
			it('should return an empty array', async () => {
				const users = await getUsers({number: 10, page: 100});
				expect(users).toEqual([]);
			});
		});
	});

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

	describe('updateUser', () => {
		describe('when updating user with valid values', () => {
			it('should return updated user', async () => {
				const expectedUser = {
					'first_name': 'Isaiah',
					'last_name': 'Neal',
					'email': 'helicopter1850@gmail.com'
				}

				const userId = 3;

				const user = await updateUser(userId, {
					'email': 'helicopter1850@gmail.com'
				});

				expect(user).toEqual(expect.objectContaining(expectedUser));
			});
		});

		describe('when updating user results in missing email & platform ID', () => {
			it('should throw an error', async () => {
				const userId = 3;

				await expect(
					updateUser(userId, {
						'email': ''
					})
				)
				.rejects
				.toThrow(new Error('User requires either an email address or an activity platform ID.'));
			});
		});

		describe('when updating user results in missing platform ID with platform set', () => {
			it('should throw an error', async () => {
				const userId = 3;

				await expect(
					updateUser(userId, {
						'activity_platform': 'strava'
					})
				)
				.rejects
				.toThrow(new Error('User requires activity platform ID when setting activity platform.'));
			});
		});

		describe('when updating user results in missing platform with platform ID set', () => {
			it('should throw an error', async () => {
				const userId = 3;

				await expect(
					updateUser(userId, {
						'activity_platform_id': '11111'
					})
				)
				.rejects
				.toThrow(new Error('User requires activity platform when setting activity platform ID.'));
			});
		});

		describe('when updating non-existent user', () => {
			it('should throw an error', async () => {
				const userId = 9999;

				await expect(
					updateUser(userId, {
						'activity_platform': 'strava',
						'activity_platform_id': '11111'
					})
				)
				.rejects
				.toThrow(new Error('User does not exist.'));
			});
		});
	});

	describe('deleteUser', () => {
		describe('when deleting existing user', () => {
			it('should return 1', async () => {
				const res = await deleteUser(1);
				expect(res).toBe(1);
			});
		});

		describe('when deleting non-existing user', () => {
			it('should throw an error', async () => {
				await expect(
					deleteUser(9999)
				)
				.rejects
				.toThrow(new Error('User does not exist.'));
			});
		});
	});
});
