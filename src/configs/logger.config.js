const log_path = './logs';

module.exports = {
	appenders: {
		console: {
			type: ['test', 'development'].includes(process.env.NODE_ENV) ? 'stdout' : 'console'
		},
		access: {
			type: 'dateFile',
			filename: `${log_path}/access.log`,
			pattern: '-yyyy-MM-dd',
			backups: 3,
		  },
		  debug: {
			type: 'dateFile',
			filename: `${log_path}/debug.log`,
			pattern: '-yyyy-MM-dd',
			backups: 3,
		  },
	},
	categories: {
		default: { appenders: ['access'], level: 'ALL' },
		access: { appenders: ['access'], level: 'DEBUG' },
		debug: { appenders: ['debug'], level: 'DEBUG' },
	},
}
