const db = require('./database.service');

const get = async (searchParams) => {
	const {
		number = 20,
		page = 1
	} = searchParams;

	try {
		const pageOffset = page > 0 ? (page-1) * number : 0;
		const result = await db.query(`SELECT * FROM users LIMIT ${number} OFFSET ${pageOffset}`);
		return result.rows;
	} catch (err) {
		console.log(err.stack);
	}

	return false;
}

const getOne = async (userId) => {
	try {
		const result = await db.query(`SELECT * FROM users WHERE id = ${userId}`);
		return result.rows;
	} catch (err) {
		console.log(err.stack);
	}

	return false;
}

const create = async (data) => {
	const {
		first_name,
		last_name,
		email,
		profile_photo = '',
		activity_platform,
		activity_platform_id
	} = data;

	if (validate(data)) {
		const sql = `INSERT INTO public.users(first_name, last_name, email, profile_photo, activity_platform, activity_platform_id)
				VALUES($1, $2, $3, $4, $5, $6)
				RETURNING id`;
		const values = [first_name, last_name, email, profile_photo, activity_platform, activity_platform_id];
		const result = await db.query(sql, values);
		return result.rows[0];
	}
}

/**
 * Validate user data before inserting.
 * @param {object} data
 * @returns Error|true
 */
const validate = (data) => {
	const {
		first_name,
		last_name,
		email,
		profile_photo = '',
		activity_platform,
		activity_platform_id
	} = data;

	// Email OR activity platform ID must be set.
	if (!email && !activity_platform_id) {
		const err = new Error('User requires either an email address or an activity platform ID.');
		err.name = 'missingEmailAndPlatformId';
		throw err;
	}

	// Actiivty platform ID must be set together with platform
	if (activity_platform_id && !activity_platform) {
		const err = new Error('User requires activity platform when setting activity platform ID.');
		err.name = 'missingPlatform';
		throw err;
	}

	return true;
}

module.exports = {
	get,
	getOne,
	create
}