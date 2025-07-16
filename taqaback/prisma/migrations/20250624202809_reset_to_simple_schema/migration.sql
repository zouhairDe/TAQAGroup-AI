/*
  Warnings:

  - You are about to drop the `bronze_anomalies_raw` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bronze_equipment_raw` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gold_anomalies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gold_equipment_health` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gold_section_performance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `silver_anomalies_clean` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `silver_equipment_clean` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `silver_sections_clean` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "silver_equipment_clean" DROP CONSTRAINT "silver_equipment_clean_section_fkey";

-- DropTable
DROP TABLE "bronze_anomalies_raw";

-- DropTable
DROP TABLE "bronze_equipment_raw";

-- DropTable
DROP TABLE "gold_anomalies";

-- DropTable
DROP TABLE "gold_equipment_health";

-- DropTable
DROP TABLE "gold_section_performance";

-- DropTable
DROP TABLE "silver_anomalies_clean";

-- DropTable
DROP TABLE "silver_equipment_clean";

-- DropTable
DROP TABLE "silver_sections_clean";

-- CreateTable
CREATE TABLE "BronzeAnomaly" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "origin" TEXT,
    "equipment" TEXT,
    "dateReported" TIMESTAMP(3),
    "priority" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BronzeAnomaly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SilverAnomaly" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "priority" TEXT,
    "status" TEXT,
    "origin" TEXT,
    "equipment" TEXT,
    "dateReported" TIMESTAMP(3),
    "cleanedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SilverAnomaly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoldAnomaly" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "features" JSONB NOT NULL,
    "prediction" TEXT,
    "confidence" DOUBLE PRECISION,
    "predictedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoldAnomaly_pkey" PRIMARY KEY ("id")
);
