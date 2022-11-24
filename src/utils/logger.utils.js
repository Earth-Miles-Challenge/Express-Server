const log4js = require('log4js');
const loggerConfig = require('../configs/logger.config');

log4js.configure(loggerConfig);

const logger = log4js.getLogger('console');

module.exports = {
	log4js,
	logger
}
