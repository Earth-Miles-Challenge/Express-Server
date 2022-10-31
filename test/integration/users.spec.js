const request = require('supertest');
const app = require('../../app');

describe('/users route', () => {
	describe('GET /users/', () => {
		it('Returns a list of users', async () => {
			const res = await request(app)
				.get('/users');
			expect(res.statusCode).toBe(200);
		});
	});

	describe('GET /users/:id', () => {
		it('Returns a single user object', async () => {
			const res = await request(app)
				.get('/users/1');
			expect(res.statusCode).toBe(200);
		});
	});

	describe('POST /users', () => {
		it('Returns a user id', async () => {
			const res = await request(app)
				.post('/users')
				.send({
					first_name: 'Test',
					last_name: 'User',
					email: 'test.user@ex.dev',
					profile_photo: 'https://localhost:9000/user-profile-image.jpg'
				});

			expect(res.statusCode).toBe(201);
			expect(res.body).toHaveProperty('id');
		});
	});
});
