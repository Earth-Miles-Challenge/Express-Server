export const getEnvironment = () => process.env.NODE_ENV ? process.env.NODE_ENV.toUpperCase() : 'DEVELOPMENT';

export const getEnvVariable = (variable: string) => process.env[`${variable}`];