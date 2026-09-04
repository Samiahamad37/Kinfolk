-- Add shared-family account metadata while preserving existing family records.
ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "User" ADD COLUMN "accountOwnerId" TEXT;
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'ADMIN';

UPDATE "User" SET "username" = lower(split_part("email", '@', 1));

WITH duplicates AS (
  SELECT "id", "username", row_number() OVER (PARTITION BY "username" ORDER BY "createdAt", "id") AS number
  FROM "User"
)
UPDATE "User" AS u
SET "username" = u."username" || '_' || duplicates.number
FROM duplicates
WHERE u."id" = duplicates."id" AND duplicates.number > 1;

UPDATE "User" SET "accountOwnerId" = "id";

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "accountOwnerId" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE INDEX "User_accountOwnerId_idx" ON "User"("accountOwnerId");
