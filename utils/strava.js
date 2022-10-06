const fs = require('fs');
const keys = require('../../private/keys.json');

module.exports = {
	_clientId: keys.stravaClientId,
	_clientSecret: keys.stravaClientSecret,
}