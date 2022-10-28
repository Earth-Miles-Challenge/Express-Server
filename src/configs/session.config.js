const session = require('express-session');
const store = new session.MemoryStore();
const env = process.env.NODE_ENV.toUpperCase();

module.exports = {
	secret: process.env[`SESSION_SECRET_${env}`],
	cookie: {
		sameSite: env === 'production' ? 'none' : 'lax',
		secure: env === 'production',
		maxAge: null
	},
	resave: false,
	saveUninitialized: false,
	store
}