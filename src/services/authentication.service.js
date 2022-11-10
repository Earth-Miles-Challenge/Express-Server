const jwt = require('jsonwebtoken');

function generateAccessToken(payload, expiresIn = '1800s') {
	return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn });
}

function verifyAccessToken(token) {
	return jwt.verify(token, process.env.TOKEN_SECRET);
}

module.exports = {
	generateAccessToken,
	verifyAccessToken
}