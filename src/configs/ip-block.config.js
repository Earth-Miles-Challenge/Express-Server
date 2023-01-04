const ipBlock = require('express-ip-block')(
	[
		"127.0.0.1",
		"172.18.0.2",
		"172.18.0.1",
		"172.22.0.1",
	],
	{
		allow: true,
		allowForwarded: true
	}
);

module.exports = ipBlock;