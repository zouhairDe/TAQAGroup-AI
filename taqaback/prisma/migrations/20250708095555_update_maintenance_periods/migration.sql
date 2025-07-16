/*
  Warnings:

  - You are about to drop the column `maintenanceWindowId` on the `slots` table. All the data in the column will be lost.
  - You are about to drop the `maintenance_windows` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "slots" DROP CONSTRAINT "slots_maintenanceWindowId_fkey";

-- DropIndex
DROP INDEX "slots_maintenanceWindowId_idx";

-- AlterTable
ALTER TABLE "slots" DROP COLUMN "maintenanceWindowId",
ADD COLUMN     "maintenancePeriodId" TEXT;

-- DropTable
DROP TABLE "maintenance_windows";

-- CreateTable
CREATE TABLE "maintenance_periods" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "durationHours" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "type" TEXT NOT NULL DEFAULT 'maintenance',
    "assignedTo" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "maintenance_periods_startDate_idx" ON "maintenance_periods"("startDate");

-- CreateIndex
CREATE INDEX "maintenance_periods_endDate_idx" ON "maintenance_periods"("endDate");

-- CreateIndex
CREATE INDEX "maintenance_periods_status_idx" ON "maintenance_periods"("status");

-- CreateIndex
CREATE INDEX "maintenance_periods_type_idx" ON "maintenance_periods"("type");

-- CreateIndex
CREATE INDEX "slots_maintenancePeriodId_idx" ON "slots"("maintenancePeriodId");

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_maintenancePeriodId_fkey" FOREIGN KEY ("maintenancePeriodId") REFERENCES "maintenance_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
