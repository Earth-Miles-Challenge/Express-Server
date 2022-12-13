const { logger } = require('../utils/logger.utils');

module.exports = {
	format: 'dev',
	options: {
		'stream': {
			write: (str) => logger.debug(str)
		}
	}
}