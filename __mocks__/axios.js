const { oAuthTokenResponse } = require('../__fixtures__/strava')

const axios = {
	get: jest.fn(() => Promise.resolve({ data: {} })),
	post: jest.fn(() => Promise.resolve({ data: {} })),
	postOAuthTokenResponse: jest.fn(() => Promise.resolve(oAuthTokenResponse))
};

module.exports = axios;