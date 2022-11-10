const { closePool } = require('../utils/database');

// beforeEach(initializeDatabase);
// afterEach(clearDatabase);
afterAll(closePool);