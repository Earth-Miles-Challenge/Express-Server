import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.utils';
import {
	getActivity,
	getActivities,
	getMostRecentActivity,
	updateActivity
} from '../services/activities.service';

import * as stravaService from '../services/strava.service';

// type ActivitiesRequest = Request & {
// 	user:
// }

const ActivitiesController = {

	/**
	 * Get current user Strava activities.
	 */
	get: async function (req: Request, res: Response, next: NextFunction) {
		try {
			const activities = await getActivities(req.user.id, req.query);
			res.json(activities);
		} catch (err) {
			logger.debug(`Error when getting activities`, err.message);
			next(err);
		}
	},

	getOne: async function(req: ActivityRequest, res: Response, next: NextFunction) {
		res.json(req.activity);
	},

	fetchLatest: async function(req: Request, res: Response, next: NextFunction) {
		try {
			const mostRecent = await getMostRecentActivity(req.user.id);
			const fromTime = mostRecent ? (new Date(mostRecent.start_date).getTime() / 1000) + 1 : 0;
			const stravaActivities = await stravaService.getAthleteActivities(req.user.id, fromTime);

			const activities = await Promise.all(stravaActivities.map((activity) => {
				return stravaService.createActivityFromStravaActivity(req.user.id, activity);
			}));

			res.json(activities);
		} catch (err) {
			// err.status = getErrorStatus(err);
			logger.debug(`Error when fetching latest activities`, err.message);
			next(err);
		}
	},

	update: async function(req: Request, res: Response, next: NextFunction) {
		try {
			const { activityId } = req.params;
			const activity = await updateActivity(activityId, req.body);

			res.json(activity);
		} catch (err) {
			logger.debug(`Error when updating an activity`, err.message);
			next(err);
		}
	},

	activityExists: async function(req: Request, res: Response, next: NextFunction) {
		const activityId = parseInt(req.params.activityId);
		const activity = await getActivity(activityId);

		if (activity) {
			req.activity = activity;
			next();
		} else {
			const err = new Error('Activity does not exist.');
			err.name = 'invalidActivity';
			err.status = 404;
			next(err);
		}
	}
};

export default ActivitiesController;