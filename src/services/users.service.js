const db = require('./database.service');

const insertUser = async (data) => {
	const {
		first_name,
		last_name,
		email,
		profile_photo
	} = data;

	const sql = 'INSERT INTO public.users(first_name, last_name, email, profile_photo) VALUES($1, $2, $3, $4) RETURNING id';
	const values = [first_name, last_name, email, profile_photo]

	try {
		const res = await db.query(sql, values);
		console.log(res);
		return res.rows[0];
	} catch (err) {
		console.log(err.stack);
	}
}

module.exports = {
	insertUser
}