/*
  Warnings:

  - You are about to drop the column `priorite` on the `bronze_anomalies_raw` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `bronze_anomalies_raw` table. All the data in the column will be lost.
  - You are about to drop the column `equipment_category` on the `silver_anomalies_clean` table. All the data in the column will be lost.
  - You are about to drop the column `priorite` on the `silver_anomalies_clean` table. All the data in the column will be lost.
  - You are about to drop the column `priority_level` on the `silver_anomalies_clean` table. All the data in the column will be lost.
  - You are about to drop the column `status_category` on the `silver_anomalies_clean` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `silver_anomalies_clean` table. All the data in the column will be lost.
  - You are about to drop the column `dates` on the `slots` table. All the data in the column will be lost.
  - You are about to drop the `gold_anomalies` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bronze_source_id]` on the table `silver_anomalies_clean` will be added. If there are existing duplicate values, this will fail.
  - Made the column `source_file` on table `bronze_anomalies_raw` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "bronze_anomalies_raw_num_equipement_idx";

-- DropIndex
DROP INDEX "silver_anomalies_clean_bronze_source_id_idx";

-- DropIndex
DROP INDEX "silver_anomalies_clean_priorite_idx";

-- DropIndex
DROP INDEX "silver_anomalies_clean_priority_level_idx";

-- DropIndex
DROP INDEX "silver_anomalies_clean_status_category_idx";

-- DropIndex
DROP INDEX "silver_anomalies_clean_statut_idx";

-- DropIndex
DROP INDEX "slots_dates_idx";

-- AlterTable
ALTER TABLE "anomalies" ADD COLUMN     "criticite" TEXT,
ADD COLUMN     "disponibilite" INTEGER,
ADD COLUMN     "fiabilite" INTEGER,
ADD COLUMN     "process_safety" INTEGER,
ADD COLUMN     "systeme" TEXT;

-- AlterTable
ALTER TABLE "bronze_anomalies_raw" DROP COLUMN "priorite",
DROP COLUMN "statut",
ADD COLUMN     "criticite" TEXT,
ADD COLUMN     "disponibilite" TEXT,
ADD COLUMN     "fiabilite_integrite" TEXT,
ADD COLUMN     "process_safety" TEXT,
ADD COLUMN     "systeme" TEXT,
ALTER COLUMN "source_file" SET NOT NULL;

-- AlterTable
ALTER TABLE "data_processing_logs" ALTER COLUMN "source_layer" DROP NOT NULL,
ALTER COLUMN "target_layer" DROP NOT NULL;

-- AlterTable
ALTER TABLE "silver_anomalies_clean" DROP COLUMN "equipment_category",
DROP COLUMN "priorite",
DROP COLUMN "priority_level",
DROP COLUMN "status_category",
DROP COLUMN "statut",
ADD COLUMN     "criticite" TEXT,
ADD COLUMN     "disponibilite" INTEGER,
ADD COLUMN     "fiabilite_integrite" INTEGER,
ADD COLUMN     "normalized_fields" JSONB,
ADD COLUMN     "process_safety" INTEGER,
ADD COLUMN     "systeme" TEXT;

-- AlterTable
ALTER TABLE "slots" DROP COLUMN "dates",
ALTER COLUMN "priority" SET DEFAULT 'medium',
ALTER COLUMN "windowType" SET DEFAULT 'maintenance';

-- DropTable
DROP TABLE "gold_anomalies";

-- CreateTable
CREATE TABLE "maintenance_windows" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "durationHours" DOUBLE PRECISION NOT NULL,
    "siteId" TEXT,
    "zoneId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "windowType" TEXT NOT NULL DEFAULT 'scheduled',
    "safetyRequirements" TEXT[],
    "resourcesNeeded" TEXT[],
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "weatherDependency" BOOLEAN NOT NULL DEFAULT false,
    "productionImpact" BOOLEAN NOT NULL DEFAULT false,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_window_dates" (
    "id" TEXT NOT NULL,
    "maintenanceWindowId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_window_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slot_maintenance_windows" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "maintenanceWindowId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "estimatedDuration" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slot_maintenance_windows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_windows_code_key" ON "maintenance_windows"("code");

-- CreateIndex
CREATE INDEX "maintenance_windows_code_idx" ON "maintenance_windows"("code");

-- CreateIndex
CREATE INDEX "maintenance_windows_startDate_idx" ON "maintenance_windows"("startDate");

-- CreateIndex
CREATE INDEX "maintenance_windows_endDate_idx" ON "maintenance_windows"("endDate");

-- CreateIndex
CREATE INDEX "maintenance_windows_status_idx" ON "maintenance_windows"("status");

-- CreateIndex
CREATE INDEX "maintenance_windows_priority_idx" ON "maintenance_windows"("priority");

-- CreateIndex
CREATE INDEX "maintenance_windows_siteId_idx" ON "maintenance_windows"("siteId");

-- CreateIndex
CREATE INDEX "maintenance_windows_zoneId_idx" ON "maintenance_windows"("zoneId");

-- CreateIndex
CREATE INDEX "maintenance_windows_createdById_idx" ON "maintenance_windows"("createdById");

-- CreateIndex
CREATE INDEX "maintenance_windows_windowType_idx" ON "maintenance_windows"("windowType");

-- CreateIndex
CREATE INDEX "maintenance_window_dates_maintenanceWindowId_idx" ON "maintenance_window_dates"("maintenanceWindowId");

-- CreateIndex
CREATE INDEX "maintenance_window_dates_date_idx" ON "maintenance_window_dates"("date");

-- CreateIndex
CREATE INDEX "maintenance_window_dates_isActive_idx" ON "maintenance_window_dates"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_window_dates_maintenanceWindowId_date_key" ON "maintenance_window_dates"("maintenanceWindowId", "date");

-- CreateIndex
CREATE INDEX "slot_maintenance_windows_slotId_idx" ON "slot_maintenance_windows"("slotId");

-- CreateIndex
CREATE INDEX "slot_maintenance_windows_maintenanceWindowId_idx" ON "slot_maintenance_windows"("maintenanceWindowId");

-- CreateIndex
CREATE INDEX "slot_maintenance_windows_assignedAt_idx" ON "slot_maintenance_windows"("assignedAt");

-- CreateIndex
CREATE UNIQUE INDEX "slot_maintenance_windows_slotId_maintenanceWindowId_key" ON "slot_maintenance_windows"("slotId", "maintenanceWindowId");

-- CreateIndex
CREATE INDEX "bronze_anomalies_raw_source_file_idx" ON "bronze_anomalies_raw"("source_file");

-- CreateIndex
CREATE UNIQUE INDEX "silver_anomalies_clean_bronze_source_id_key" ON "silver_anomalies_clean"("bronze_source_id");

-- CreateIndex
CREATE INDEX "silver_anomalies_clean_processed_at_idx" ON "silver_anomalies_clean"("processed_at");

-- CreateIndex
CREATE INDEX "silver_anomalies_clean_criticite_idx" ON "silver_anomalies_clean"("criticite");

-- AddForeignKey
ALTER TABLE "maintenance_windows" ADD CONSTRAINT "maintenance_windows_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_windows" ADD CONSTRAINT "maintenance_windows_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_windows" ADD CONSTRAINT "maintenance_windows_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_windows" ADD CONSTRAINT "maintenance_windows_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_window_dates" ADD CONSTRAINT "maintenance_window_dates_maintenanceWindowId_fkey" FOREIGN KEY ("maintenanceWindowId") REFERENCES "maintenance_windows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot_maintenance_windows" ADD CONSTRAINT "slot_maintenance_windows_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot_maintenance_windows" ADD CONSTRAINT "slot_maintenance_windows_maintenanceWindowId_fkey" FOREIGN KEY ("maintenanceWindowId") REFERENCES "maintenance_windows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
