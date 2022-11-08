const getEnvironment = () => process.env.NODE_ENV.toUpperCase();
const getEnvVariable = (variable) => process.env[`${variable}_${getEnvironment()}`];

module.exports = {
	getEnvironment,
	getEnvVariable
}