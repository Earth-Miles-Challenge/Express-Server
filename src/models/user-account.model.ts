import { DataTypes, Model, Deferrable } from 'sequelize';
import { sequelize } from '../services/database.service';

export class UserAccount extends Model {}

UserAccount.init({
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
	email: { type: DataTypes.STRING(128), unique: true, defaultValue: null },
	first_name: DataTypes.STRING(64),
	last_name: DataTypes.STRING(64),
	profile_photo: DataTypes.STRING(256),
	activity_platform: DataTypes.ENUM('strava'),
	activity_platform_id: DataTypes.STRING(128),
	created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
	sequelize,
  	indexes: [
		{
			unique: true, fields: ["activity_platform", "activity_platform_id"]
		}
	]
});