/*
  Warnings:

  - You are about to drop the column `actualCost` on the `maintenance_windows` table. All the data in the column will be lost.
  - You are about to drop the column `approvedAt` on the `maintenance_windows` table. All the data in the column will be lost.
  - You are about to drop the column `approvedById` on the `maintenance_windows` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `maintenance_windows` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `maintenance_windows` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedCost` on the `maintenance_windows` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `maintenance_windows` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `maintenance_windows` table. All the data in the column will be lost.
  - You are about to drop the column `productionImpact` on the `maintenance_windows` table. All the data in the column will be lost.
  - You are about to drop the column `resourcesNeeded` on the `maintenance_windows` table. All the data in the column will be lost.
  - You are about to drop the column `safetyRequirements` on the `maintenance_windows` table. All the data in the column will be lost.
  - You are about to drop the column `siteId` on the `maintenance_windows` table. All the data in the column will be lost.
  - You are about to drop the column `weatherDependency` on the `maintenance_windows` table. All the data in the column will be lost.
  - You are about to drop the column `windowType` on the `maintenance_windows` table. All the data in the column will be lost.
  - You are about to drop the column `zoneId` on the `maintenance_windows` table. All the data in the column will be lost.
  - You are about to alter the column `durationHours` on the `maintenance_windows` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the `maintenance_window_dates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `slot_maintenance_windows` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `month` to the `maintenance_windows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `maintenance_windows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `maintenance_windows` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "maintenance_window_dates" DROP CONSTRAINT "maintenance_window_dates_maintenanceWindowId_fkey";

-- DropForeignKey
ALTER TABLE "maintenance_windows" DROP CONSTRAINT "maintenance_windows_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "maintenance_windows" DROP CONSTRAINT "maintenance_windows_createdById_fkey";

-- DropForeignKey
ALTER TABLE "maintenance_windows" DROP CONSTRAINT "maintenance_windows_siteId_fkey";

-- DropForeignKey
ALTER TABLE "maintenance_windows" DROP CONSTRAINT "maintenance_windows_zoneId_fkey";

-- DropForeignKey
ALTER TABLE "slot_maintenance_windows" DROP CONSTRAINT "slot_maintenance_windows_maintenanceWindowId_fkey";

-- DropForeignKey
ALTER TABLE "slot_maintenance_windows" DROP CONSTRAINT "slot_maintenance_windows_slotId_fkey";

-- DropIndex
DROP INDEX "maintenance_windows_code_idx";

-- DropIndex
DROP INDEX "maintenance_windows_code_key";

-- DropIndex
DROP INDEX "maintenance_windows_createdById_idx";

-- DropIndex
DROP INDEX "maintenance_windows_priority_idx";

-- DropIndex
DROP INDEX "maintenance_windows_siteId_idx";

-- DropIndex
DROP INDEX "maintenance_windows_windowType_idx";

-- DropIndex
DROP INDEX "maintenance_windows_zoneId_idx";

-- AlterTable
ALTER TABLE "maintenance_windows" DROP COLUMN "actualCost",
DROP COLUMN "approvedAt",
DROP COLUMN "approvedById",
DROP COLUMN "code",
DROP COLUMN "createdById",
DROP COLUMN "estimatedCost",
DROP COLUMN "name",
DROP COLUMN "priority",
DROP COLUMN "productionImpact",
DROP COLUMN "resourcesNeeded",
DROP COLUMN "safetyRequirements",
DROP COLUMN "siteId",
DROP COLUMN "weatherDependency",
DROP COLUMN "windowType",
DROP COLUMN "zoneId",
ADD COLUMN     "location" TEXT,
ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'maintenance',
ADD COLUMN     "year" INTEGER NOT NULL,
ALTER COLUMN "durationHours" SET DATA TYPE INTEGER,
ALTER COLUMN "status" SET DEFAULT 'available';

-- AlterTable
ALTER TABLE "slots" ADD COLUMN     "maintenanceWindowId" TEXT,
ALTER COLUMN "priority" DROP DEFAULT,
ALTER COLUMN "windowType" DROP DEFAULT;

-- DropTable
DROP TABLE "maintenance_window_dates";

-- DropTable
DROP TABLE "slot_maintenance_windows";

-- CreateIndex
CREATE INDEX "maintenance_windows_month_year_idx" ON "maintenance_windows"("month", "year");

-- CreateIndex
CREATE INDEX "maintenance_windows_type_idx" ON "maintenance_windows"("type");

-- CreateIndex
CREATE INDEX "slots_maintenanceWindowId_idx" ON "slots"("maintenanceWindowId");

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_maintenanceWindowId_fkey" FOREIGN KEY ("maintenanceWindowId") REFERENCES "maintenance_windows"("id") ON DELETE SET NULL ON UPDATE CASCADE;
