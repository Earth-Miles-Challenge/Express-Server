const { validationResult } = require('express-validator');

function checkValidation(req, res, next) {
	const result = validationResult(req);

	if (!result.isEmpty()) {
		res.status(403).send({ errors: result.array() });
	}

	return next();
}


module.exports = {
	checkValidation
}