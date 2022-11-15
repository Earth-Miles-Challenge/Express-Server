const getEnvironment = () => process.env.NODE_ENV ? process.env.NODE_ENV.toUpperCase() : 'DEVELOPMENT';
const getEnvVariable = (variable) => process.env[`${variable}_${getEnvironment()}`];

module.exports = {
	getEnvironment,
	getEnvVariable
}