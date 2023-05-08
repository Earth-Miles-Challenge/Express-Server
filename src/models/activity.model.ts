import { DataTypes, Model, Deferrable } from 'sequelize';
import { sequelize } from '../services/database.service';

import { UserAccount } from './user-account.model';

export class Activity extends Model {}

Activity.init({
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
	user_id: {
		type: DataTypes.INTEGER,
		references: {
			model: UserAccount,
			key: 'id',
			deferrable: Deferrable.INITIALLY_IMMEDIATE
		}
		// ADD FOREIGN KEY REFERENCES
	},
	activity_platform: DataTypes.ENUM('strava'),
	activity_platform_activity_id: DataTypes.STRING(255),
	activity_type: DataTypes.ENUM('run', 'ride', 'ebike-ride', 'walk'),
	description: DataTypes.STRING,
	start_date: DataTypes.DATE,
	timezone: DataTypes.STRING,
	distance: DataTypes.FLOAT,
	commute: DataTypes.BOOLEAN,
	start_latlng: DataTypes.STRING,
	end_latlng: DataTypes.STRING,
	map_polyline: DataTypes.TEXT,
}, {
	sequelize,
  	indexes: [
		{
			unique: true, fields: ["activity_platform", "activity_platform_activity_id"]
		}
	]
});