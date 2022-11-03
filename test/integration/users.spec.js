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
			expect(res.body).toHaveProperty('id');
			expect(res.body.id).toEqual(expect.any(Number));
		});

		it('Inserts a user without an email but with a Strava ID', async () => {
			const res = await request(app)
				.post('/users')
				.send({
					first_name: 'Muttonchop',
					last_name: 'Moe',
					activity_platform: 'strava',
					activity_platform_id: 12345
				});

			expect(res.statusCode).toBe(201);
			expect(res.body).toHaveProperty('id');
		});

		it('Does not insert user without an email address of Strava ID', async () => {
			const res = await request(app)
				.post('/users')
				.send({
					first_name: 'Fingerless',
					last_name: 'Freddy',
				});

			expect(res.statusCode).toBe(400);
			expect(res.body).not.toHaveProperty('id');
			expect(res.text).toEqual('User requires either an email address or an activity platform ID.');
		});

		it('Does not insert user when platform ID is set out without platform name', async () => {
			const res = await request(app)
				.post('/users')
				.send({
					first_name: 'Cottontop',
					last_name: 'Cal',
					email: 'cottontop.cal@ex.dev',
					activity_platform_id: 23456
				});

			expect(res.statusCode).toBe(400);
			expect(res.body).not.toHaveProperty('id');
			expect(res.text).toEqual('User requires activity platform when setting activity platform ID.');
		});
	});
});
