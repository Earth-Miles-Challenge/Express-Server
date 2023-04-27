import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

const app = express();

import createError from 'http-errors';
import cookieParser from 'cookie-parser';

import morgan from 'morgan';
import morganConfig from './morgan.config';

import logger from '../utils/logger.utils';

import usersRouter from '../routes/users.route';
import authRouter from '../routes/auth.route';
import globalImpactRouter from '../routes/global-impact.route';
import webhooksRouter from '../routes/webhooks.route';

// Middleware
app.use(morgan(morganConfig.format, morganConfig.options));
app.use(logger.express);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routers
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/impact', globalImpactRouter);

app.use('/webhooks', webhooksRouter);

// 404 handler
app.use(function(req: Request, res: Response, next: NextFunction) {
	next(createError(404));
});

// Error handler
app.use(function(err: { message: string, status?: number}, req: Request, res: Response, next: NextFunction) {
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