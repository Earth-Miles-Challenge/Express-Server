module.exports = {
	appenders: {
		console: { type: ['test', 'development'].includes(process.env.NODE_ENV) ? 'stdout' : 'console' },
		file: { type: "file", filename: "logs/out.log" }
	},
	categories: {
		default: { appenders: ['console', 'file'], level: 'info' },
	},
  }
