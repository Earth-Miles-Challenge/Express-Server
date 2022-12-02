const db = require('./database.service');
const { logger } = require('../utils/logger.utils');

const getActivityImpact = async (activityId) => {
	const result = await db.query(`
		SELECT
			activity_id,
			fossil_alternative_distance,
			fossil_alternative_polyline,
			fossil_alternative_co2
		FROM activity_impact
		WHERE activity_id = $1`,
		[activityId]
	);

	return result.rows.length ? result.rows[0] : null;
}

const createActivityImpact = async (data) => {
	if (validate(data)) {
		const sql = `INSERT INTO activity_impact(
			activity_id,
			fossil_alternative_distance,
			fossil_alternative_polyline,
			fossil_alternative_co2
		)
		VALUES($1, $2, $3, $4)
		RETURNING *`;

		const values = [
			data.activity_id,
			data.fossil_alternative_distance,
			data.fossil_alternative_polyline,
			data.fossil_alternative_co2,
		];

		const result = await db.query(sql, values);
		return result.rows[0];
	}
	/*
	data : {
		activity_id: activity.id,
		fossil_alternative_distance: 2000,
		fossil_alternative_polyline: "myPolyline",
		fossil_alternative_co2: 384
	}
	*/

}

const updateActivityImpact = async (activityId, newData) => {
	const existingData = await getActivityImpact(activityId);

	if (!existingData) {
		const err = new Error(`Activity Impact does not exist.`);
		err.name = 'invalidActivityImpact';
		throw err;
	}

	if(validate(Object.assign(existingData, newData))) {
		const validColumns = getColumnNames();
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

		const sql = `UPDATE activity_impact
					SET ${updateSql.join(',')}
					WHERE activity_id = $${n}
					RETURNING *`;

		const result = await db.query(sql, [...updateValues, activityId]);
		return result.rows[0];
	}
}

const deleteActivityImpact = async (activityId) => {
	const activityImpact = await getActivityImpact(activityId);

	if (!activityImpact) {
		const err = new Error('Activity Impact does not exist.');
		err.name = 'invalidActivityImpact';
		throw err;
	}

	const sql = `DELETE FROM activity_impact
				WHERE activity_id = $1`;
	const result = await db.query(sql, [activityId]);
	return result.rowCount;
}

/**
 * Validate activity data before inserting/updating.
 * @param {object} data
 * @returns Error|true
 */
 const validate = (data) => {
	const requiredFields = [
		'activity_id',
		'fossil_alternative_distance',
		'fossil_alternative_co2',
	];

	const requiredFieldErrors = requiredFields.reduce((errors, field) => {
		if (!data.hasOwnProperty(field) || !data[field]) {
			return [
				...errors,
				field
			];
		} else {
			return errors;
		}
	}, []);

	if (requiredFieldErrors.length) {
		const err = new Error(`Missing required fields: ${requiredFieldErrors.join(', ')}`);
		err.name = 'missingRequiredFields';
		throw err;
	}

	return true;
}

const getColumnNames = () => [
	'activity_id',
	'fossil_alternative_distance',
	'fossil_alternative_polyline',
	'fossil_alternative_co2',
];

module.exports = {
	getActivityImpact,
	createActivityImpact,
	updateActivityImpact,
	deleteActivityImpact,
}