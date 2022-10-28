const { expect } = require('chai');
const request = require('supertest');
const app = require('../../app');

describe('/users route', () => {
	describe('GET /users/', () => {
		it('Returns a list of users', async () => {
			const res = await request(app)
				.get('/users');

			expect(res.statusCode).toBe(201);
			expect(res.body).toMatchObject({});
		});
	});
});
