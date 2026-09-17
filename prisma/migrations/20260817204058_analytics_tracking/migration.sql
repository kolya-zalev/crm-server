-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "userId" TEXT,
ADD COLUMN     "userName" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "closedById" TEXT,
ADD COLUMN     "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'member';

-- CreateIndex
CREATE INDEX "Lead_status_statusChangedAt_idx" ON "Lead"("status", "statusChangedAt");

-- CreateIndex
CREATE INDEX "Lead_closedById_idx" ON "Lead"("closedById");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
