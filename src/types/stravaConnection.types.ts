export type StravaConnection = {
	user_id: number,
	strava_id: string,
	expires_at: number,
	expires_in: number,
	refresh_token: string,
	access_token: string,
	activity_write: boolean,
	activity_read_all: boolean,
	profile_read_all: boolean
}