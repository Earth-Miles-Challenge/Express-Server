const { createUser, getUser, getUserByPlatformId, getUsers, updateUser, deleteUser } = require('../../src/services/users.service');
const db = require('../../src/services/database.service');
const { initializeDatabase,
	populateUsers
} = require('../utils/database');
const { generatePlatformId, generateEmail, generateNewUser } = require('../utils/fixture-generator');

beforeAll(async () => await populateUsers());

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

	xdescribe('getUser', () => {
		describe('when called with ID of existing user', () => {
			it('should return user object', async () => {
				const expectedUser = {
					'first_name': 'Delmy',
					'last_name': 'Hamilton',
					'email': 'staffing2025@outlook.com'
				};

				const user = await getUser(1);

				expect(user).toEqual(expect.objectContaining(JSON.parse(JSON.stringify(expectedUser))));
			});
		});

		describe('when called with ID not belong to any user', () => {
			it('should return falsy value', async () => {
				const user = await getUser(9999);

				expect(user).toBeFalsy();
			});
		});
	});

	xdescribe('getUserByPlatformId', () => {
		describe('when called with platform ID of existing user', () => {
			it('should return user object', async () => {
				const platformId = generatePlatformId();
				const platform = 'strava';

				const userData = await generateNewUser({
					activity_platform_id: platformId,
					activity_platform: platform
				});

				const user = await getUserByPlatformId(platform, platformId);
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

	xdescribe('createUser', () => {
		describe('when called with all values', () => {
			it('should create a new user', async () => {
				const res = await createUser({
					first_name: 'Test',
					last_name: 'User',
					email: generateEmail(),
					profile_photo: 'https://localhost:9000/user-profile-image.jpg',
					activity_platform_id: generatePlatformId(),
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
					activity_platform_id: generatePlatformId(),
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
					email: generateEmail(),
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
						email: generateEmail(),
						activity_platform_id: generatePlatformId()
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
						email: generateEmail(),
						activity_platform: 'strava'
					})
				)
				.rejects
				.toThrow(new Error('User requires activity platform ID when setting activity platform.'));
			});
		});
	});

	xdescribe('updateUser', () => {
		describe('when updating user with valid values', () => {
			it('should return updated user', async () => {
				const newUser = await generateNewUser();
				const expectedUser = {
					...newUser,
					email: generateEmail()
				}
				const user = await updateUser(newUser.id, {
					'email': expectedUser.email
				});

				expect(user).toEqual(expect.objectContaining(expectedUser));
			});
		});

		describe('when updating user results in missing email & platform ID', () => {
			it('should throw an error', async () => {
				const newUser = await generateNewUser();

				await expect(
					updateUser(newUser.id, {
						'email': ''
					})
				)
				.rejects
				.toThrow(new Error('User requires either an email address or an activity platform ID.'));
			});
		});

		describe('when updating user results in missing platform ID with platform set', () => {
			it('should throw an error', async () => {
				const newUser = await generateNewUser();

				await expect(
					updateUser(newUser.id, {
						'activity_platform': 'strava'
					})
				)
				.rejects
				.toThrow(new Error('User requires activity platform ID when setting activity platform.'));
			});
		});

		describe('when updating user results in missing platform with platform ID set', () => {
			it('should throw an error', async () => {
				const newUser = await generateNewUser();

				await expect(
					updateUser(newUser.id, {
						'activity_platform_id': generatePlatformId()
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
						'activity_platform_id': generatePlatformId()
					})
				)
				.rejects
				.toThrow(new Error('User does not exist.'));
			});
		});
	});

	xdescribe('deleteUser', () => {
		describe('when deleting existing user', () => {
			it('should return 1', async () => {
				const newUser = await generateNewUser();
				const res = await deleteUser(newUser.id);
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
