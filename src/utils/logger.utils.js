const log4js = require('log4js');
const loggerConfig = require('../configs/logger.config');

log4js.configure(loggerConfig);

const logger = log4js.getLogger('console');

const readLog = () => {
	let log = fs.readFileSync('logs/out.log','utf8', (error, content) => {
		if(error) {
			logger.error(error);
			return error;
		}
		return content;
	});
	return log;
}

module.exports = {
	log4js,
	logger,
	readLog
}
