require('dotenv').config({path: './.env'});

const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const session = require('express-session');
const sessionConfig = require('./src/configs/session.config');

const usersRouter = require('./src/routes/users.route');
const authRouter = require('./src/routes/auth.route');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('trust proxy', 1);

app.use(session(sessionConfig));


// cors
app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true
}));

app.all('*', (req, res, next) => {
	console.log('Session ID: ' + req.session.id);
	next();
});

app.use('/users', usersRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
