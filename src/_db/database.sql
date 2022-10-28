CREATE TYPE IF NOT EXISTS "activity_types" AS ENUM (
  'run',
  'ride',
  'walk'
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" int serial primary key,
  "email" varchar(128),
  "first_name" varchar(64),
  "last_name" varchar(64),
  "profile_photo" varchar(256),
  "created_at" timestamptz
);

CREATE TABLE IF NOT EXISTS "strava_connection_details" (
  "user_id" int,
  "strava_id" varchar,
  "expires_at" int,
  "expires_in" int,
  "refresh_token" varchar,
  "access_token" varchar,
  PRIMARY KEY ("user_id")
);

CREATE TABLE IF NOT EXISTS "activities" (
  "id" int,
  "user_id" int,
  "strava_activity_id" text,
  "activity_type" activity_types,
  "description" varchar,
  "start_date" timestamptz,
  "start_date_local" timestamptz,
  "timezone" varchar,
  "utc_offset" integer,
  "distance" float,
  "commute" boolean,
  "start_latlng" varchar,
  "end_latlng" varchar,
  "co2_avoided_grams" integer,
  PRIMARY KEY ("id")
);

CREATE INDEX ON "activities" ("activity_type");

ALTER TABLE "strava_connection_details" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "activities" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
