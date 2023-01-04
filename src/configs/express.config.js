const express = require('express');
const app = express();

const createError = require('http-errors');
const cookieParser = require('cookie-parser');

const morgan = require('morgan');
const morganConfig = require('./morgan.config');

const ipBlock = require('./ip-block.config');

const logger = require('../utils/logger.utils');

const usersRouter = require('../routes/users.route');
const authRouter = require('../routes/auth.route');
const globalImpactRouter = require('../routes/global-impact.route');

// Middleware
app.use(morgan(morganConfig.format, morganConfig.options));
app.use(logger.express);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// IP Block
app.use(ipBlock);

// Routers
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/impact', globalImpactRouter);

// 404 handler
app.use(function(req, res, next) {
	next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
	res.locals.message = err.message;

	if (req.app.get('env') === 'development') {
		console.error(err);
		res.locals.error = err;
	} else {
		res.locals.error = {};
	}

	res.status(err.status || 500);
	res.send(err.message);
});

module.exports = app;