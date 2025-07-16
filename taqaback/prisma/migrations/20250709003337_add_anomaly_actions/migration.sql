/*
  Warnings:

  - A unique constraint covering the columns `[fileId]` on the table `attachments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileId` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "fileId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "file_storage" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "bucket" TEXT,
    "key" TEXT,
    "metadata" JSONB,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "entityType" TEXT,
    "entityId" TEXT,
    "tags" TEXT[],
    "description" TEXT,
    "checksum" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "file_storage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anomaly_actions" (
    "id" TEXT NOT NULL,
    "anomalyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "performedById" TEXT NOT NULL,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT,
    "priority" TEXT,
    "severity" TEXT,
    "category" TEXT,
    "impact" JSONB,
    "maintenanceData" JSONB,
    "attachments" TEXT[],
    "isAutomated" BOOLEAN NOT NULL DEFAULT false,
    "aiConfidence" DOUBLE PRECISION,

    CONSTRAINT "anomaly_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "file_storage_uploadedBy_idx" ON "file_storage"("uploadedBy");

-- CreateIndex
CREATE INDEX "file_storage_entityType_entityId_idx" ON "file_storage"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "file_storage_status_idx" ON "file_storage"("status");

-- CreateIndex
CREATE INDEX "file_storage_uploadedAt_idx" ON "file_storage"("uploadedAt");

-- CreateIndex
CREATE INDEX "file_storage_bucket_key_idx" ON "file_storage"("bucket", "key");

-- CreateIndex
CREATE INDEX "anomaly_actions_anomalyId_idx" ON "anomaly_actions"("anomalyId");

-- CreateIndex
CREATE INDEX "anomaly_actions_type_idx" ON "anomaly_actions"("type");

-- CreateIndex
CREATE INDEX "anomaly_actions_performedById_idx" ON "anomaly_actions"("performedById");

-- CreateIndex
CREATE INDEX "anomaly_actions_teamId_idx" ON "anomaly_actions"("teamId");

-- CreateIndex
CREATE INDEX "anomaly_actions_createdAt_idx" ON "anomaly_actions"("createdAt");

-- CreateIndex
CREATE INDEX "anomaly_actions_category_idx" ON "anomaly_actions"("category");

-- CreateIndex
CREATE UNIQUE INDEX "attachments_fileId_key" ON "attachments"("fileId");

-- CreateIndex
CREATE INDEX "attachments_fileId_idx" ON "attachments"("fileId");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file_storage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anomaly_actions" ADD CONSTRAINT "anomaly_actions_anomalyId_fkey" FOREIGN KEY ("anomalyId") REFERENCES "anomalies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anomaly_actions" ADD CONSTRAINT "anomaly_actions_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anomaly_actions" ADD CONSTRAINT "anomaly_actions_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
