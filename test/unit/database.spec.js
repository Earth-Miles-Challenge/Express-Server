const db = require('../../src/services/database.service');

describe('Database service', () => {
	describe('All tables exist', () => {
		it('the users table exists', async () => {
			const expected = ['users', 'strava_connection', 'activities'].map((table) => {
				return {tablename: table}
			});

			const response = await db.query(`
				SELECT tablename
				FROM pg_catalog.pg_tables
				WHERE schemaname != 'pg_catalog'
				AND schemaname != 'information_schema';
			`);

			expect(response).toHaveProperty('rows');
			expect(response.rows).toEqual(expect.arrayContaining(expected));
		})
	});
});