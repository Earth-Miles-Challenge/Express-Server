const { closePool } = require('../utils/database');

afterAll(closePool);