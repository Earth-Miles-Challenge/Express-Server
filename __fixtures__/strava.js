const oAuthTokenResponse = {
	data: {
		token_type: 'Bearer',
		expires_at: 1568775134,
		expires_in: 21600,
		refresh_token: 'e5n567567e5n567567',
		access_token: 'a4b945687ga4b945687g',
		athlete: {
			id: '123abc456def',
			firstname: 'Pascal',
			lastname: 'Grant',
			profile: 'pascal.grant',
			city: 'Melbourne',
			state: 'Victoria',
			country: 'Australia',
		}
	}
};

module.exports = {
	oAuthTokenResponse
}