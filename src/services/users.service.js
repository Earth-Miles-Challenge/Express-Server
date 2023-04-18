const db = require('./database.service');
const { logger } = require('../utils/logger.utils');

const getUsers = async (searchParams = {}) => {
	const {
		number = 20,
		page = 1
	} = searchParams;

	const pageOffset = page > 0 ? (page-1) * number : 0;
	const result = await db.query(`SELECT *
		FROM user_account
		LIMIT ${number}
		OFFSET ${pageOffset}`
	);
	return result.rows;
}

const getUser = async (userId) => {
	const result = await db.query(`
		SELECT *
		FROM user_account
		WHERE id = $1`,
		[userId]
	);
	return result?.rows[0];
}

const getUserByEmail = async (email) => {
	const result = await db.query(`
		SELECT *
		FROM user_account
		WHERE email = $1`,
		[email]
	);
	return result?.rows[0];
}

const getUserByPlatformId = async (platform, platform_id) => {
	const result = await db.query(`
		SELECT *
		FROM user_account
		WHERE activity_platform = $1
		AND activity_platform_id = $2`,
		[platform, platform_id]
	);
	return result.rows[0];
}

const createUser = async (data) => {
	const {
		first_name,
		last_name,
		email,
		profile_photo = '',
		activity_platform,
		activity_platform_id
	} = data;

	if (validate(data)) {
		const sql = `INSERT INTO user_account(first_name, last_name, email, profile_photo, activity_platform, activity_platform_id)
				VALUES($1, $2, $3, $4, $5, $6)
				RETURNING *`;
		const values = [first_name, last_name, email, profile_photo, activity_platform, activity_platform_id];
		const result = await db.query(sql, values);
		return result.rows[0];
	}
}

const updateUser = async (userId, newData) => {
	const existingData = await getUser(userId);

	if (!existingData) {
		const err = new Error(`User does not exist.`);
		err.name = 'invalidUser';
		throw err;
	}

	if (validate(Object.assign(existingData, newData))) {
		const validColumns = ['first_name', 'last_name', 'email', 'profile_photo', 'activity_platform', 'activity_platform_id'];

		const [updateSql, n, updateValues] = Object.keys(newData).reduce(([sql, n, values], column) => {
			if (!validColumns.includes(column)) {
				const err = new Error(`Unknown column ${column} passed.`);
				err.name = 'invalidColumn';
				throw err;
			}

			return [
				[...sql, `${column} = ($${n})`],
				n + 1,
				[...values, newData[column]]
			];
		}, [[], 1, []]);

		const sql = `UPDATE user_account
					SET ${updateSql.join(',')}
					WHERE id = $${n}
					RETURNING *`;

		const result = await db.query(sql, [...updateValues, userId]);
		return result.rows[0];
	}
}

const deleteUser = async (userId) => {
	const user = await getUser(userId);

	if (!user) {
		const err = new Error('User does not exist.');
		err.name = 'invalidUser';
		throw err;
	}

	const sql = `DELETE FROM user_account
				WHERE id = $1`;
	const result = await db.query(sql, [userId]);
	return result.rowCount;
}

/**
 * Validate user data before inserting.
 * @param {object} data
 * @returns Error|true
 */
const validate = (data) => {
	const {
		email,
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

	// Actiivty platform must be set together with platform ID
	if (activity_platform && !activity_platform_id) {
		const err = new Error('User requires activity platform ID when setting activity platform.');
		err.name = 'missingPlatformId';
		throw err;
	}

	return true;
}

module.exports = {
	getUsers,
	getUser,
	getUserByEmail,
	getUserByPlatformId,
	createUser,
	updateUser,
	deleteUser
}