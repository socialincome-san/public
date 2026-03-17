CREATE TYPE "Profile" AS ENUM ('male', 'female', 'youth');

ALTER TABLE "program"
ADD COLUMN "target_profiles" "Profile"[] NOT NULL DEFAULT ARRAY[]::"Profile"[];
