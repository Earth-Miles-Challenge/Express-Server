const session = require('express-session');
const store = new session.MemoryStore();

module.exports = {
	secret: process.env.SESSION_SECRET,
	cookie: {
		sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: null
	},
	resave: false,
	saveUninitialized: false,
	store
}