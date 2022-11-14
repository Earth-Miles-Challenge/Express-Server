const { createUser } = require("../../src/services/users.service");
const { generateAccessToken } = require('../../src/services/authentication.service');

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

const getTokenForUser = (user) => {
	const tokenKeys = [ 'id', 'first_name', 'last_name', 'profile_photo', 'activity_platform' ];
	const filteredData = Object.entries(user).filter(([key, value]) => -1 !== tokenKeys.indexOf(key) );
	const tokenData = Object.fromEntries(filteredData);
	return generateAccessToken(tokenData, '2 days');
}

module.exports = {
	generatePlatformId,
	generateEmail,
	generateNewUser,
	getTokenForUser
}