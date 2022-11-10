module.exports = {
	appenders: {
		console: { type: process.env.NODE_ENV === 'test' ? 'stdout' : 'console' },
	},
	categories: {
		default: { appenders: ['console'], level: 'info' },
	},
  }
