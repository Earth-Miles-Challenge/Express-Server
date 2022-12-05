const { closePool, initializeDatabase } = require('../utils/database');

beforeAll(async () => await initializeDatabase().catch(e => console.error(e.stack)));
afterAll(async () => await closePool());