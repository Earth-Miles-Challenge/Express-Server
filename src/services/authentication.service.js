const jwt = require('jsonwebtoken');

function generateAccessToken(payload, expiresIn = '1800s') {
	return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn });
}

module.exports = {
	generateAccessToken
}