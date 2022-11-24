const {
	generateAccessToken,
	verifyAccessToken
} = require('../../src/services/authentication.service');

describe('Authentication service', () => {
	describe('when generating a token with default expiration', () => {
		it('verifying it should return object containing original payload', () => {
			const payload = {
				'a': 'First letter',
				'b': 'Second letter'
			};
			const token = generateAccessToken(payload);
			const verified = verifyAccessToken(token);
			expect(verified).toEqual(expect.objectContaining(payload));
		});

		it('should have difference of 1800 between iat and exp', () => {
			const payload = {
				'a': 'First letter',
				'b': 'Second letter'
			};
			const token = generateAccessToken(payload);
			const verified = verifyAccessToken(token);
			expect(verified.exp - verified.iat).toEqual(1800);
		});
	});

	describe('when generating a token with custom expiration', () => {
		it('difference between iat and exp should match custom expiration in seconds', () => {
			const payload = {
				'a': 'First letter',
				'b': 'Second letter'
			};
			const token = generateAccessToken(payload, '5d');
			const verified = verifyAccessToken(token);
			const expectedDifference = 5 * 24 * 60 * 60;
			expect(verified.exp - verified.iat).toEqual(expectedDifference);
		});
	});
});