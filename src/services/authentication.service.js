const jwt = require('jsonwebtoken');

function generateAccessToken(payload, expiresIn = '1800s') {
	return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn });
}

function verifyAccessToken(token) {
	return jwt.verify(token, process.env.TOKEN_SECRET);
}

const isValidPassword = (password, hash, salt) => {
	const hashVerify = crypto
		.pbkdf2Sync(password, salt, 10000, 64, "sha512")
		.toString("hex");
	return hash === hashVerify;
  }

const generatePassword = (password) => {
	const salt = crypto.randomBytes(32).toString("hex");
	const genHash = crypto
		.pbkdf2Sync(password, salt, 10000, 64, "sha512")
		.toString("hex");

	return {
		salt: salt,
		hash: genHash,
	};
}

module.exports = {
	generateAccessToken,
	verifyAccessToken,
	isValidPassword,
	generatePassword
}