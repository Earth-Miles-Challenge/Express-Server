const mockAxios = require('../../__mocks__/axios');
const { activitiesResponse } = require('../../__fixtures__/strava');
const onboardingService = require('../../src/services/onboarding.service');
const { initializeDatabase } = require('../utils/database');
const {
	generateNewUser,
	generateStravaConnectionForUser,
	generatePlatformId} = require('../utils/fixture-generator');
const { logger } = require('../../src/utils/logger.utils');

// beforeEach(async () => await initializeDatabase().catch(e => console.error(e.stack)));

describe('Onboarding service', () => {
	describe('onboardUser', () => {
		xdescribe('when onboarding a Strava user', () => {
			it('should call onboardStravaUser', async () => {
				const user = await generateNewUser({
					activity_platform: 'strava',
					activity_platform_id: '123456789'
				});
				const onboardStravaUser = jest.fn();
				await onboardingService.onboardUser(user);
				expect(onboardStravaUser).toHaveBeenCalled();
			});
		});
	});

	describe('onboardStravaUser', () => {
		describe('when onboarding user with 6 runs, 2 rides, 1 walk and 1 swim', () => {
			it('should have processed 10 activities and created 9', async () => {
				mockAxios.get.mockResolvedValue(activitiesResponse);

				const user = await generateNewUser({
					activity_platform: 'strava',
					activity_platform_id: generatePlatformId()
				});
				await generateStravaConnectionForUser(user);
				const response = await onboardingService.onboardStravaUser(user);

				expect(response.activities.length).toEqual(9);
				expect(response.activitiesProcessed).toEqual(10);
			});
		});

		describe('when onboarding with no activities', () => {
			it('should have processed 0 activities and created 0', async () => {
				mockAxios.get.mockResolvedValue({data:[]});

				const user = await generateNewUser({
					activity_platform: 'strava',
					activity_platform_id: generatePlatformId()
				});
				await generateStravaConnectionForUser(user);
				const response = await onboardingService.onboardStravaUser(user);

				expect(response.activities.length).toEqual(0);
				expect(response.activitiesProcessed).toEqual(0);
			});
		});
	});
});