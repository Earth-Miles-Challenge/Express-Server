CREATE TYPE "activity_types" AS ENUM (
  'run',
  'ride',
  'walk'
);

CREATE TYPE "activity_platform" AS ENUM (
  'strava'
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" serial primary key,
  "email" varchar(128) unique,
  "first_name" varchar(64),
  "last_name" varchar(64),
  "profile_photo" varchar(256),
  "activity_platform" activity_platform,
  "activity_platform_id" varchar(128),
  "created_at" timestamp,
  UNIQUE (activity_platform, activity_platform_id)
);

CREATE TABLE IF NOT EXISTS "strava_connection_details" (
  "user_id" int REFERENCES "users" (id),
  "expires_at" int,
  "expires_in" int,
  "refresh_token" varchar,
  "access_token" varchar,
  PRIMARY KEY ("user_id")
);

CREATE TABLE IF NOT EXISTS "activities" (
  "id" int,
  "user_id" int REFERENCES "users" (id),
  "strava_activity_id" text,
  "activity_type" activity_types,
  "description" varchar,
  "start_date" timestamp,
  "start_date_local" timestamp,
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

-- ALTER TABLE "strava_connection_details" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- ALTER TABLE "activities" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");