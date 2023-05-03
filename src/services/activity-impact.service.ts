import { ActivityData, ActivityId, ActivityImpact } from '../types/activities.types';
import db from './database.service';
import { logger } from '../utils/logger.utils';

export const getActivityImpact = async (activityId: ActivityId) => {
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

export const createActivityImpact = async (data: ActivityImpact) => {
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
}

export const updateActivityImpact = async (activityId: ActivityId, newData: ActivityImpact) => {
	logger.info('updateActivityImpact');
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

		logger.info(updateSql);
		logger.info(updateValues);
		const sql = `UPDATE activity_impact
					SET ${updateSql.join(',')}
					WHERE activity_id = $${n}
					RETURNING *`;

		const result = await db.query(sql, [...updateValues, activityId]);
		return result.rows[0];
	}
}

export const upcreateActivityImpact = async (activityId: ActivityId, newData: ActivityImpact) => {
	const exists = await getActivityImpact(activityId);

	// Delete the activity impact if the data has been set to null
	if (exists && newData === null) return await deleteActivityImpact(activityId);

	return exists
		? await updateActivityImpact(activityId, newData)
		: await createActivityImpact({
			...newData,
			activity_id: activityId
		});
}

export const deleteActivityImpact = async (activityId: ActivityId) => {
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
 * Get the estimated number of grams of co2 avoided by the activity.
 * @param {object} activity
 * @returns int
 */
export const getEmissionsAvoidedForActivity = (activity: ActivityData) => {
	if (!activity.commute) return 0;

	/**
	 * This is based on the average emissions of medium & small cars.
	 * @see https://ourworldindata.org/travel-carbon-footprint
	 */
	const estimatedEmissionsPerKm = 165;

	/**
	 * @todo Instead of taking the activity distance, calculate distance of fossil fuel powered alternative
	 */
	return Math.round(activity.distance / 1000 * estimatedEmissionsPerKm);
}

/**
 * Validate activity data before inserting/updating.
 * @param {object} data
 * @returns Error|true
 */
 const validate = (data: ActivityData) => {
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