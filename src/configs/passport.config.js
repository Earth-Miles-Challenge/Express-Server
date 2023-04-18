const passport = require('passport');
// const LocalStrategy = require('passport-local');
// const crypto = require('crypto');
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { getUserByEmail, getUser } = require('../services/users.service');

// passport.use(new LocalStrategy(function verify(username, password, cb) {
// 	getUserByEmail(username)
// 		.then((user) => {
// 			if (!user) {
// 				return cb(null, false, { message: 'Incorrect email or password.' });
// 			}

// 			// Function defined at bottom of app.js
// 			const isValid = isValidPassword(password, user.hash, user.salt);

// 			if (isValid) {
// 				return cb(null, user);
// 			} else {
// 				return cb(null, false, { message: 'Incorrect email or password.' });
// 			}
// 		})
// 		.catch((err) => {
// 			cb(err);
// 		});
// }));

const options = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.TOKEN_SECRET || 'secret',
};

passport.use(
	new JwtStrategy(options, function (jwt_payload, done) {
		getUser(jwt_payload.id)
			.then((user) => {
				if (user) {
					return done(null, user);
				} else {
					return done(null, false);
				}
			})
			.catch((err) => {
				return done(err, false);
			});
	})
  );

passport.serializeUser((user, cb) => {
	cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
	const user = await getUser(id);
	if (user) return cb(null, user);
	return cb('No such user');
});

module.exports = passport;