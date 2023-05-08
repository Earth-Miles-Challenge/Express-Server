import { Sequelize } from 'sequelize';
import { getEnvironment } from '../utils/env.utils';

const getInstance = (env: string) => {
	const connectionString = env === 'TEST' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('Missing database connection string.');
	}

	return new Sequelize(connectionString);
}

export const sequelize = getInstance(getEnvironment());

const authenticate = async () => {
	try {
		await sequelize.authenticate();
		console.log('Connection has been established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
}

authenticate();

export default sequelize;