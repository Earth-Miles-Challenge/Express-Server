const db = require('./database.service');

const create = async (data) => {
	const {
		first_name,
		last_name,
		email,
		profile_photo
	} = data;

	const sql = 'INSERT INTO public.users(first_name, last_name, email, profile_photo) VALUES($1, $2, $3, $4) RETURNING id';
	const values = [first_name, last_name, email, profile_photo]

	try {
		const result = await db.query(sql, values);
		return result.rows;
	} catch (err) {
		console.log(err.stack);
		return
	}
}

module.exports = {
	create
}