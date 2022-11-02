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
		profile_photo = ''
	} = data;

	const sql = 'INSERT INTO public.users(first_name, last_name, email, profile_photo) VALUES($1, $2, $3, $4) RETURNING id';
	const values = [first_name, last_name, email, profile_photo]

	try {
		const result = await db.query(sql, values);
		return result.rows[0];
	} catch (err) {
		console.log(err.stack);
	}

	return false;
}

module.exports = {
	get,
	getOne,
	create
}