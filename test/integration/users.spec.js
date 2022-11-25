const request = require('supertest');
const app = require('../../app');
const {
	generatePlatformId,
	generateEmail,
	generateNewUser,
	getTokenForUser } = require('../utils/fixture-generator');
const {
	initializeDatabase,
	getClient,
	populateUsers } = require('../utils/database');
const {
	getComparisonUserData } = require('../utils/comparison-data');

beforeAll(async () => {
	await initializeDatabase().catch(e => console.error(e.stack));
});

describe('/users route', () => {
	describe('GET /users/', () => {
		describe('when fetching users without query params', () => {
			it('should return a list of 20 users', async () => {
				await populateUsers();

				const res = await request(app)
					.get('/users');

				expect(res.statusCode).toBe(200);
				expect(res.body.length).toBe(20);
			});
		});

		describe('when fetching users with number param', () => {
			it('should return the correct number of users', async () => {
				await populateUsers();

				const numberOfUsers = 12;
				const res = await request(app)
					.get(`/users?number=${numberOfUsers}`);

				expect(res.statusCode).toBe(200);
				expect(res.body.length).toBe(numberOfUsers);
			});
		});

		describe('when fetching users with number and page params', () => {
			it('should return users offset by number of pages', async () => {
				await populateUsers();

				const numberOfUsers = 10;
				const res = await request(app)
					.get(`/users?number=${numberOfUsers}&page=2`);

				const expectedUser = {
					'first_name': 'Travis',
					'last_name': 'Maxwell',
					'email': 'minerals1997@outlook.com'
				};

				expect(res.statusCode).toBe(200);
				expect(res.body[0]).toEqual(expect.objectContaining(expectedUser));
			});
		})
	});

	describe('GET /users/:id', () => {
		describe('when fetching existing user', () => {
			it('should return 200 and a single user object', async () => {
				const newUser = await generateNewUser();
				const token = getTokenForUser(newUser)
				const res = await request(app)
					.get(`/users/${newUser.id}`)
					.set('Authorization', 'Bearer ' + token);

				expect(res.statusCode).toBe(200);
				expect(getComparisonUserData(res.body)).toEqual(expect.objectContaining(newUser));
			});
		});

		describe('when fetching deleted user', () => {
			it('should return 404 and error message', async () => {
				const newUser = await generateNewUser();
				const token = getTokenForUser(newUser)

				// Delete the user
				const client = await getClient();
				await client.query(`DELETE FROM user_account WHERE id = $1`, [newUser.id]);

				// Test
				const res = await request(app)
					.get(`/users/${newUser.id}`)
					.set('Authorization', 'Bearer ' + token);

				expect(res.statusCode).toBe(404);
				expect(res.text).toEqual('User does not exist.');
			});
		});
	});

	describe('POST /users', () => {
		describe('when creating with email address', () => {
			it('should return 201 with user object', async () => {
				const res = await request(app)
					.post('/users')
					.send({
						email: generateEmail()
					});

				expect(res.statusCode).toBe(201);
				expect(res.body).toHaveProperty('id');
				expect(res.body.id).toEqual(expect.any(Number));
			});
		});

		describe('when adding user without an email but with platform ID', () => {
			it('should return 201 with user object', async () => {
				const res = await request(app)
					.post('/users')
					.send({
						first_name: 'Muttonchop',
						last_name: 'Moe',
						activity_platform: 'strava',
						activity_platform_id: generatePlatformId()
					});

				expect(res.statusCode).toBe(201);
				expect(res.body).toHaveProperty('id');
			});
		});

		describe('when adding user with no email or platform ID', () => {
			it('should return 400 with error message', async () => {
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
		});

		describe('when adding user with platform ID but without platform name', () => {
			it('should return 400 with error message', async () => {
				const res = await request(app)
					.post('/users')
					.send({
						first_name: 'Cottontop',
						last_name: 'Cal',
						email: generateEmail(),
						activity_platform_id: generatePlatformId()
					});

				expect(res.statusCode).toBe(400);
				expect(res.body).not.toHaveProperty('id');
				expect(res.text).toEqual('User requires activity platform when setting activity platform ID.');
			});
		});
	});

	describe('PUT /users/:id', () => {
		describe('when updating with valid data', () => {
			it('should return the updated user', async () => {
				const user = await generateNewUser();
				const updateData = {
					'activity_platform': 'strava',
					'activity_platform_id': generatePlatformId()
				}

				// Convert JS object to JSON object
				const expectedUser = JSON.parse(JSON.stringify({
					...user,
					...updateData
				}));

				const res = await request(app)
					.put(`/users/${user.id}`)
					.set('Authorization', `Bearer ${getTokenForUser(user)}`)
					.send(updateData);

				expect(res.statusCode).toBe(200);
				expect(res.body).toEqual(expectedUser);
			});
		});

		describe('when updating deleted user', () => {
			it('should return 404 with error message', async () => {
				const user = await generateNewUser();

				// Delete the user
				const client = await getClient();
				await client.query(`DELETE FROM user_account WHERE id = $1`, [user.id]);

				const res = await request(app)
					.put(`/users/${user.id}`)
					.set('Authorization', `Bearer ${getTokenForUser(user)}`)
					.send({
						'first_name': 'Dave'
					});

				expect(res.statusCode).toBe(404);
				expect(res.text).toEqual('User does not exist.');
			});
		});

		describe('when updating user without an email address or Strava ID', () => {
			it('should return 400 with error message', async () => {
				const user = await generateNewUser();
				const updateData = {
					'email': '',
					'activity_platform': '',
					'activity_platform_id': ''
				}

				const res = await request(app)
					.put(`/users/${user.id}`)
					.set('Authorization', `Bearer ${getTokenForUser(user)}`)
					.send(updateData);

				expect(res.statusCode).toBe(400);
				expect(res.body).not.toHaveProperty('id');
				expect(res.text).toEqual('User requires either an email address or an activity platform ID.');
			});
		});

		describe('when updating user with platform ID but no platform name', () => {
			it('should return 400 with error message', async () => {
				const user = await generateNewUser();
				const updateData = {
					'activity_platform': '',
					'activity_platform_id': generatePlatformId()
				}

				const res = await request(app)
					.put(`/users/${user.id}`)
					.set('Authorization', `Bearer ${getTokenForUser(user)}`)
					.send(updateData);

				expect(res.statusCode).toBe(400);
				expect(res.body).not.toHaveProperty('id');
				expect(res.text).toEqual('User requires activity platform when setting activity platform ID.');
			});
		});

		describe('when updating user with platform but no platform ID', () => {
			it('should return 400 with error message', async () => {
				const user = await generateNewUser();
				const updateData = {
					'activity_platform': 'strava',
					'activity_platform_id': ''
				}

				const res = await request(app)
					.put(`/users/${user.id}`)
					.set('Authorization', `Bearer ${getTokenForUser(user)}`)
					.send(updateData);

				expect(res.statusCode).toBe(400);
				expect(res.body).not.toHaveProperty('id');
				expect(res.text).toEqual('User requires activity platform ID when setting activity platform.');
			});
		});
	});

	describe('DELETE /users/:id', () => {
		it('Returns 204 status response', async () => {
			const user = await generateNewUser();

			const res = await request(app)
				.delete(`/users/${user.id}`)
				.set('Authorization', `Bearer ${getTokenForUser(user)}`)
				.send();

			expect(res.statusCode).toBe(204);
		});

		it('Returns 404 status response for unknown user', async () => {
			const user = await generateNewUser();

			// Delete the user
			const client = await getClient();
			await client.query(`DELETE FROM user_account WHERE id = $1`, [user.id]);

			const res = await request(app)
				.delete(`/users/${user.id}`)
				.set('Authorization', `Bearer ${getTokenForUser(user)}`)
				.send();

			expect(res.statusCode).toBe(404);
		});
	});
});
