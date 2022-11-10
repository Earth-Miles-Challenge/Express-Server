const { createUser } = require("../../src/services/users.service");

let platformId = 1;
let emailId = 1;

const generatePlatformId = () => {
	platformId += 1;
	return `${platformId-1}`;
}

const generateEmail = () => {
	emailId += 1;
	return `test${emailId-1}@user.dev`;
}

const generateNewUser = async (data) => {
	return await createUser({
		...{
			first_name: 'Test',
			last_name: 'User',
			email: generateEmail()
		},
		...data
	});
}

module.exports = {
	generatePlatformId,
	generateEmail,
	generateNewUser
}