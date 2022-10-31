const express = require('express');
const app = express();

const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const cors = require('cors');
const corsConfig = require('./cors.config');

const session = require('express-session');
const sessionConfig = require('./session.config');

const usersRouter = require('../routes/users.route');
const authRouter = require('../routes/auth.route');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session(sessionConfig));
app.use(cors(corsConfig));

/** @todo remove this eventually, or do something similar in logger? */
app.all('*', (req, res, next) => {
	if (process.NODE_ENV === 'development') {
		console.log('Session ID: ' + req.session.id);
	}
	next();
});

// Routers
app.use('/users', usersRouter);
app.use('/auth', authRouter);

// 404 handler
app.use(function(req, res, next) {
	next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.status(err.status || 500);
	res.send(err.message);
});

module.exports = app;