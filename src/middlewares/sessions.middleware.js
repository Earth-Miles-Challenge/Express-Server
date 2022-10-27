
module.exports = session({
	secret: keys.sessionSecret,
	cookie: {
		sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: null
	},
	store
});