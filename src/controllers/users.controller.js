const {
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser } = require('../services/users.service');
const { logger } = require('../utils/logger.utils');
const { onboardUser } = require('../services/onboarding.service');

async function get(req, res, next) {
	try {
		const users = await getUsers(req.query);
		res.json(users);
	} catch (err) {
		logger.debug(`Error when getting users`, err.message);
		next(err);
	}
}

async function getOne(req, res, next) {
	res.json(req.user);
}

async function update(req, res, next) {
	try {
		const user = await updateUser(req.user.id, req.body);
		res.status(200).json(user);
	} catch (err) {
		err.status = getErrorStatus(err);
		logger.debug(`Error when updating user`, err.message);
		next(err);
	}
}

async function create(req, res, next) {
	try {
		const user = await createUser(req.body);
		res.status(201).json(user);
	} catch (err) {
		err.status = getErrorStatus(err);
		logger.debug(`Error when creating user`, err.message);
		next(err);
	}
}

async function remove(req, res, next) {
	try {
		await deleteUser(req.params.userId);
		res.status(204).send();
	} catch (err) {
		err.status = getErrorStatus(err);
		logger.debug(`Error when removing user`, err.message);
		next(err);
	}
}

async function onboard(req, res, next) {
	try {
		const response = await onboardUser(req.params.userId);
		res.status(200).send(response);
	} catch (err) {
		err.status = getErrorStatus(err);
		logger.debug(`Error when onboarding user`, err.message);
		next(err);
	}
}

async function userExists(req, res, next) {
	const userId = parseInt(req.params.userId);
	const user = await getUser(userId);

	if (user) {
		req.user = user;
		next();
	} else {
		const err = new Error('User does not exist.');
		err.name = 'invalidUser';
		err.status = 404;
		next(err);
	}
}

function getErrorStatus(error) {
	switch (error.name) {
		case 'missingEmailAndPlatformId':
		case 'missingPlatform':
		case 'missingPlatformId':
			return 400;
		case 'invalidUser':
			return 404;
		default:
			return 500;
	}
}

module.exports = {
	get,
	getOne,
	create,
	update,
	remove,
	onboard,
	userExists
};
