/*
  Warnings:

  - Added the required column `equipmentIdentifier` to the `anomalies` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "anomalies" DROP CONSTRAINT "anomalies_equipmentId_fkey";

-- AlterTable: Add equipmentIdentifier column with default value first
ALTER TABLE "anomalies" ADD COLUMN "equipmentIdentifier" TEXT NOT NULL DEFAULT 'unknown-equipment';

-- Update existing records: Set equipmentIdentifier to the current equipmentId value
UPDATE "anomalies" SET "equipmentIdentifier" = "equipmentId" WHERE "equipmentId" IS NOT NULL;

-- AlterTable: Make equipmentId optional
ALTER TABLE "anomalies" ALTER COLUMN "equipmentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "anomalies" ADD CONSTRAINT "anomalies_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
