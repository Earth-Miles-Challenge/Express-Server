const request = require('supertest');
const app = require('../../app');

describe('/users route', () => {
	describe('GET /users/', () => {
		it('Returns a list of 20 users', async () => {
			const res = await request(app)
				.get('/users');

			expect(res.statusCode).toBe(200);
			expect(res.body.length).toBe(20);
		});

		it('Returns the correct number of users', async () => {
			const numberOfUsers = 12;
			const res = await request(app)
				.get(`/users?number=${numberOfUsers}`);

			expect(res.statusCode).toBe(200);
			expect(res.body.length).toBe(numberOfUsers);
		});

		it('Returns users offset by number of pages', async () => {
			const numberOfUsers = 10;
			const res = await request(app)
				.get(`/users?number=${numberOfUsers}&page=2`);

			const expectedUser = {
				"first_name": "Travis",
				"last_name": "Maxwell",
				"email": "minerals1997@outlook.com"
			};

			expect(res.statusCode).toBe(200);
			expect(res.body[0]).toEqual(expect.objectContaining(expectedUser));
		});
	});

	describe('GET /users/:id', () => {
		it('Returns a single user object', async () => {
			const expectedUser = {
				"first_name": "Isaiah",
				"last_name": "Neal",
				"email": "helicopter1850@live.com"
			};

			const res = await request(app)
				.get('/users/3');

			expect(res.statusCode).toBe(200);
			expect(res.body[0]).toEqual(expect.objectContaining(expectedUser));
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
			expect(res.body[0]).toHaveProperty('id');
			expect(res.body[0].id).toEqual(expect.any(Number));
		});

		it('Does not insert user without any data', async () => {
			const res = await request(app)
				.post('/users')
				.send();

			expect(res.statusCode).toBe(201);
			expect(res.body[0]).not.toHaveProperty('id');
		});
	});
});
