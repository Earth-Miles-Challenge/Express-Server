const express = require('express');
const app = express();

const createError = require('http-errors');
const cookieParser = require('cookie-parser');

const morgan = require('morgan');
const morganConfig = require('./morgan.config');

const logger = require('../utils/logger.utils');

const cors = require('cors');
const corsConfig = require('./cors.config');

const session = require('express-session');
const sessionConfig = require('./session.config');

const usersRouter = require('../routes/users.route');
const authRouter = require('../routes/auth.route');
const globalImpactRouter = require('../routes/global-impact.route');

// Middleware
app.use(morgan(morganConfig.format, morganConfig.options));
app.use(logger.express);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session(sessionConfig));
app.use(cors(corsConfig));
// app.use(cors());

/** @todo remove this eventually, or do something similar in logger? */
app.all('*', (req, res, next) => {
	if (process.NODE_ENV === 'development') {
		logger.logger.info('Session ID: ' + req.session.id);
	}
	next();
});

// Routers
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/impact', globalImpactRouter);

// 404 handler
app.use(function(req, res, next) {
	next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
	res.locals.message = err.message;

	if (req.app.get('env')=== 'development') {
		console.error(err);
		res.locals.error = err;
	} else {
		res.locals.error = {};
	}

	res.status(err.status || 500);
	res.send(err.message);
});

module.exports = app;