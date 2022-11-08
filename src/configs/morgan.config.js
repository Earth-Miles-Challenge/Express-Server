const { log4js, logger } = require('../services/logger.service');

module.exports = {
	format: 'dev',
	options: {
		'stream': {
			write: (str) => logger.debug(str)
		}
	}
}