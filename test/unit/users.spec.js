const { createUser, getUser, getUsers, updateUser, deleteUser } = require('../../src/services/users.service');
const { initializeDatabase, clearDatabase } = require('../utils/database');

beforeEach(initializeDatabase);
afterEach(clearDatabase);

describe('Users service', () => {
	describe('insertUser', () => {
		it('Creates a new user with all values', async () => {
			const res = await createUser({
				first_name: 'Test',
				last_name: 'User',
				email: 'test.user@ex.dev',
				profile_photo: 'https://localhost:9000/user-profile-image.jpg'
			});

			expect(res).toHaveProperty('id');
			expect(res.id).toBeGreaterThanOrEqual(1);
		});

		it('Creates a new user without an email address', async () => {
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

	describe('', () => {
		// it('Returns a single user object', async () => {
		// });
	});
});
