-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill from the lead_created activity
UPDATE "Lead" AS l
SET "createdAt" = a."createdAt"
FROM "Activity" AS a
WHERE a."leadId" = l."id"
  AND a."type" = 'lead_created';
