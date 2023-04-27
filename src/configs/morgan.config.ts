import { logger } from '../utils/logger.utils';

const config = {
	format: 'dev',
	options: {
		'stream': {
			write: (str: string) => logger.debug(str)
		}
	}
}

export default config;