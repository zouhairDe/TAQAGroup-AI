-- AlterTable
ALTER TABLE "bronze_anomalies_raw" ADD COLUMN     "equipment_id" TEXT;

-- AlterTable
ALTER TABLE "silver_anomalies_clean" ADD COLUMN     "equipment_id" TEXT;
