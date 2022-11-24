const { log4js, logger } = require('../utils/logger.utils');

module.exports = {
	format: 'dev',
	options: {
		'stream': {
			write: (str) => logger.debug(str)
		}
	}
}