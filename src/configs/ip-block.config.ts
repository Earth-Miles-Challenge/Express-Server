const ipBlock = require('express-ip-block')(
	[
		"172.18.0.2",
		"172.18.0.3",
		"172.18.0.4",
		"172.18.0.5",
		"172.18.0.1",
		"172.22.0.1",
		"172.22.0.2",
		"172.22.0.3",
		"172.22.0.4",
		"172.22.0.5",
	],
	{
		allow: true,
		allowForwarded: false
	}
);

module.exports = ipBlock;