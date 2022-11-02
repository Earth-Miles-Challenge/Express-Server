const usersService = require('../../src/services/users.service');
const app = require('../../app');

describe('Users service', () => {
	describe('insertUser', () => {
		it('creates a new user with all values', async () => {
			const res = await usersService.create({
				first_name: 'Test',
				last_name: 'User',
				email: 'test.user@ex.dev',
				profile_photo: 'https://localhost:9000/user-profile-image.jpg'
			});

			expect(res).toHaveProperty('id');
			expect(res.id).toBeGreaterThanOrEqual(1);
		});

		it('creates a new user without an email address', async () => {
			const res = await usersService.create({
				first_name: 'Test',
				last_name: 'User'
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
