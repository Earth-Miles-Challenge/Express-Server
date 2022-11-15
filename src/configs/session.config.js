const session = require('express-session');
const store = new session.MemoryStore();
const { getEnvironment, getEnvVariable } = require('../utils/env.utils');

module.exports = {
	secret: getEnvVariable('SESSION_SECRET'),
	cookie: {
		sameSite: getEnvironment() === 'PRODUCTION' ? 'none' : 'lax',
		secure: getEnvironment() === 'PRODUCTION',
		maxAge: null
	},
	resave: false,
	saveUninitialized: false,
	store
}