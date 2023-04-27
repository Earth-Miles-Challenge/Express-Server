import session from 'express-session';
import { getEnvironment, getEnvVariable } from '../utils/env.utils';

const store = new session.MemoryStore();
const config = {
	secret: getEnvVariable('SESSION_SECRET'),
	cookie: {
		sameSite: getEnvironment() === 'PRODUCTION' ? 'none' : 'lax',
		secure: getEnvironment() === 'PRODUCTION',
		maxAge: null
	},
	resave: false,
	saveUninitialized: false,
	store
}

export default config;