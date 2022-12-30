const getEnvironment = () => process.env.NODE_ENV ? process.env.NODE_ENV.toUpperCase() : 'DEVELOPMENT';
const getEnvVariable = (variable) => process.env[`${variable}`];

module.exports = {
	getEnvironment,
	getEnvVariable
}