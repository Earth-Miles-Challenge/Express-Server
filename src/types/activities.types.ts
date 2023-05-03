export type ActivityId = number;

export type ActivityImpact = {
	activity_id: number,
	fossil_alternative_distance: number,
	fossil_alternative_polyline?: string,
	fossil_alternative_co2: number
}

export type ActivityData = {
	id?: number,
	user_id?: number,
	activity_platform: 'strava',
	activity_platform_activity_id: string,
	activity_type: string,
	name: string,
	description: string,
	start_date: string,
	timezone: string,
	distance: number,
	start_latlng: string,
	end_latlng: string,
	map: {
		summary_polyline: string
	},
	commute: number,
	activity_impact: ActivityImpact
}

export type ActivityDataJoined = ActivityData & ActivityImpact;