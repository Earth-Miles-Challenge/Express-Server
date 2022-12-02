CREATE TYPE "activity_type" AS ENUM (
  'run',
  'ride',
  'walk'
);

CREATE TYPE "activity_platform" AS ENUM (
  'strava'
);

CREATE TABLE IF NOT EXISTS "user_account" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(128) UNIQUE DEFAULT null,
  "first_name" VARCHAR(64),
  "last_name" VARCHAR(64),
  "profile_photo" VARCHAR(256),
  "activity_platform" activity_platform,
  "activity_platform_id" VARCHAR(128),
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (activity_platform, activity_platform_id)
);

CREATE TABLE IF NOT EXISTS "strava_connection" (
  "user_id" INT REFERENCES "user_account" (id) ON DELETE CASCADE,
  "strava_id" INT,
  "expires_at" INT,
  "expires_in" INT,
  "access_token" VARCHAR,
  "activity_write" BOOLEAN DEFAULT false,
  "activity_read_all" BOOLEAN DEFAULT false,
  "profile_read_all" BOOLEAN DEFAULT false,
  PRIMARY KEY ("user_id")
);

CREATE TABLE IF NOT EXISTS "strava_refresh_token" (
  "user_id" INT REFERENCES "user_account" (id) ON DELETE CASCADE,
  "refresh_token" VARCHAR,
  PRIMARY KEY ("user_id")
);

CREATE TABLE IF NOT EXISTS "activity" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT REFERENCES "user_account" (id) ON DELETE CASCADE,
  "activity_platform" activity_platform,
  "activity_platform_activity_id" VARCHAR(255),
  "activity_type" activity_type,
  "description" VARCHAR,
  "start_date" TIMESTAMPTZ,
  "timezone" VARCHAR,
  "distance" FLOAT,
  "start_latlng" VARCHAR,
  "end_latlng" VARCHAR,
  "map_polyline" TEXT,
  "commute" BOOLEAN
  UNIQUE ("activity_platform", "activity_platform_activity_id")
);

CREATE TABLE IF NOT EXISTS "activity_impact" (
  "activity_id" INT REFERENCES "activity" (id) ON DELETE CASCADE,
  "fossil_alternative_distance" FLOAT,
  "fossil_alternative_polyline" TEXT,
  "fossil_alternative_co2" INTEGER
);

CREATE INDEX ON "activity" ("activity_type");
CREATE INDEX ON "activity_impact" ("fossil_alternative_co2");

-- ALTER TABLE "strava_connection" ADD FOREIGN KEY ("user_id") REFERENCES "user_account" ("id");

-- ALTER TABLE "activities" ADD FOREIGN KEY ("user_id") REFERENCES "user_account" ("id");