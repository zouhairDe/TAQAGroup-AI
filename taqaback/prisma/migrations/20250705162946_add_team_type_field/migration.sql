/*
  Warnings:

  - You are about to drop the `BronzeAnomaly` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GoldAnomaly` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SilverAnomaly` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT;

-- DropTable
DROP TABLE "BronzeAnomaly";

-- DropTable
DROP TABLE "GoldAnomaly";

-- DropTable
DROP TABLE "SilverAnomaly";

-- CreateTable
CREATE TABLE "bronze_anomalies_raw" (
    "id" TEXT NOT NULL,
    "num_equipement" TEXT,
    "description" TEXT,
    "date_detection_anomalie" TEXT,
    "statut" TEXT,
    "priorite" TEXT,
    "description_equipement" TEXT,
    "section_proprietaire" TEXT,
    "source_file" TEXT,
    "raw_data" JSONB,
    "ingested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "is_processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "bronze_anomalies_raw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "silver_anomalies_clean" (
    "id" TEXT NOT NULL,
    "num_equipement" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date_detection_anomalie" TIMESTAMP(3) NOT NULL,
    "statut" TEXT NOT NULL,
    "priorite" TEXT,
    "description_equipement" TEXT NOT NULL,
    "section_proprietaire" TEXT NOT NULL,
    "data_quality_score" DOUBLE PRECISION,
    "validation_errors" JSONB,
    "priority_level" INTEGER,
    "status_category" TEXT,
    "equipment_category" TEXT,
    "bronze_source_id" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "silver_anomalies_clean_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gold_anomalies" (
    "id" TEXT NOT NULL,
    "num_equipement" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date_detection_anomalie" TIMESTAMP(3) NOT NULL,
    "statut" TEXT NOT NULL,
    "priorite" TEXT,
    "description_equipement" TEXT NOT NULL,
    "section_proprietaire" TEXT NOT NULL,
    "data_quality_score" DOUBLE PRECISION,
    "validation_errors" JSONB,
    "priority_level" INTEGER,
    "status_category" TEXT,
    "equipment_category" TEXT,
    "bronze_source_id" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gold_anomalies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT,
    "site" TEXT,
    "phone" TEXT,
    "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdBy" TEXT,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "capacity" TEXT,
    "status" TEXT NOT NULL,
    "coordinates" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "leadId" TEXT,
    "specialties" TEXT[],
    "location" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "skills" TEXT[],
    "experience" TEXT,
    "rating" DOUBLE PRECISION,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "siteId" TEXT NOT NULL,
    "zoneId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'operational',
    "manufacturer" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "installDate" TIMESTAMP(3),
    "lastMaintenance" TIMESTAMP(3),
    "nextMaintenance" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anomalies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "assignedToId" TEXT,
    "assignedTeamId" TEXT,
    "reportedById" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "safetyImpact" BOOLEAN NOT NULL DEFAULT false,
    "environmentalImpact" BOOLEAN NOT NULL DEFAULT false,
    "productionImpact" BOOLEAN NOT NULL DEFAULT false,
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "downtimeHours" DOUBLE PRECISION,
    "slaHours" INTEGER,
    "dueDate" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "aiConfidence" DOUBLE PRECISION,
    "aiSuggestedSeverity" TEXT,
    "aiFactors" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anomalies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "anomalyId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "anomalyId" TEXT,
    "rexId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_tasks" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "plannedDowntime" DOUBLE PRECISION,
    "actualDowntime" DOUBLE PRECISION,
    "assignedTeamId" TEXT,
    "assignedToId" TEXT,
    "siteId" TEXT,
    "zoneId" TEXT,
    "equipmentIds" TEXT[],
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "resourcesNeeded" TEXT[],
    "safetyRequirements" TEXT[],
    "weatherDependency" BOOLEAN NOT NULL DEFAULT false,
    "criticalPath" BOOLEAN NOT NULL DEFAULT false,
    "linkedAnomalyIds" TEXT[],
    "completionRate" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rex_entries" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "anomalyId" TEXT,
    "equipmentId" TEXT,
    "equipmentType" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "site" TEXT NOT NULL,
    "zone" TEXT,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "rootCause" TEXT NOT NULL,
    "lessonsLearned" TEXT NOT NULL,
    "preventiveActions" TEXT[],
    "solution" TEXT NOT NULL,
    "timeToResolve" TEXT,
    "costImpact" TEXT,
    "downtimeHours" DOUBLE PRECISION,
    "safetyImpact" BOOLEAN NOT NULL DEFAULT false,
    "environmentalImpact" BOOLEAN NOT NULL DEFAULT false,
    "productionImpact" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "knowledgeValue" TEXT NOT NULL,
    "reusabilityScore" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "bookmarks" INTEGER NOT NULL DEFAULT 0,
    "relatedAnomalyIds" TEXT[],
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rex_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "criticalAnomalies" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceReminders" BOOLEAN NOT NULL DEFAULT true,
    "teamAssignments" BOOLEAN NOT NULL DEFAULT true,
    "systemAlerts" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReports" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_metrics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "previousValue" DOUBLE PRECISION,
    "change" DOUBLE PRECISION,
    "trend" TEXT,
    "target" DOUBLE PRECISION,
    "unit" TEXT,
    "status" TEXT,
    "period" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "siteId" TEXT,

    CONSTRAINT "kpi_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileUrl" TEXT,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bronze_anomalies_raw_ingested_at_idx" ON "bronze_anomalies_raw"("ingested_at");

-- CreateIndex
CREATE INDEX "bronze_anomalies_raw_is_processed_idx" ON "bronze_anomalies_raw"("is_processed");

-- CreateIndex
CREATE INDEX "bronze_anomalies_raw_num_equipement_idx" ON "bronze_anomalies_raw"("num_equipement");

-- CreateIndex
CREATE INDEX "silver_anomalies_clean_num_equipement_idx" ON "silver_anomalies_clean"("num_equipement");

-- CreateIndex
CREATE INDEX "silver_anomalies_clean_statut_idx" ON "silver_anomalies_clean"("statut");

-- CreateIndex
CREATE INDEX "silver_anomalies_clean_priorite_idx" ON "silver_anomalies_clean"("priorite");

-- CreateIndex
CREATE INDEX "silver_anomalies_clean_priority_level_idx" ON "silver_anomalies_clean"("priority_level");

-- CreateIndex
CREATE INDEX "silver_anomalies_clean_status_category_idx" ON "silver_anomalies_clean"("status_category");

-- CreateIndex
CREATE INDEX "silver_anomalies_clean_section_proprietaire_idx" ON "silver_anomalies_clean"("section_proprietaire");

-- CreateIndex
CREATE INDEX "silver_anomalies_clean_date_detection_anomalie_idx" ON "silver_anomalies_clean"("date_detection_anomalie");

-- CreateIndex
CREATE INDEX "silver_anomalies_clean_bronze_source_id_idx" ON "silver_anomalies_clean"("bronze_source_id");

-- CreateIndex
CREATE INDEX "gold_anomalies_num_equipement_idx" ON "gold_anomalies"("num_equipement");

-- CreateIndex
CREATE INDEX "gold_anomalies_statut_idx" ON "gold_anomalies"("statut");

-- CreateIndex
CREATE INDEX "gold_anomalies_priorite_idx" ON "gold_anomalies"("priorite");

-- CreateIndex
CREATE INDEX "gold_anomalies_priority_level_idx" ON "gold_anomalies"("priority_level");

-- CreateIndex
CREATE INDEX "gold_anomalies_status_category_idx" ON "gold_anomalies"("status_category");

-- CreateIndex
CREATE INDEX "gold_anomalies_section_proprietaire_idx" ON "gold_anomalies"("section_proprietaire");

-- CreateIndex
CREATE INDEX "gold_anomalies_date_detection_anomalie_idx" ON "gold_anomalies"("date_detection_anomalie");

-- CreateIndex
CREATE INDEX "gold_anomalies_bronze_source_id_idx" ON "gold_anomalies"("bronze_source_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "user_profiles_userId_idx" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "user_profiles_site_idx" ON "user_profiles"("site");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE INDEX "departments_code_idx" ON "departments"("code");

-- CreateIndex
CREATE INDEX "departments_isActive_idx" ON "departments"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "sites_code_key" ON "sites"("code");

-- CreateIndex
CREATE INDEX "sites_code_idx" ON "sites"("code");

-- CreateIndex
CREATE INDEX "sites_status_idx" ON "sites"("status");

-- CreateIndex
CREATE UNIQUE INDEX "teams_code_key" ON "teams"("code");

-- CreateIndex
CREATE INDEX "teams_code_idx" ON "teams"("code");

-- CreateIndex
CREATE INDEX "teams_type_idx" ON "teams"("type");

-- CreateIndex
CREATE INDEX "teams_leadId_idx" ON "teams"("leadId");

-- CreateIndex
CREATE INDEX "teams_isActive_idx" ON "teams"("isActive");

-- CreateIndex
CREATE INDEX "team_members_teamId_idx" ON "team_members"("teamId");

-- CreateIndex
CREATE INDEX "team_members_userId_idx" ON "team_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_teamId_userId_key" ON "team_members"("teamId", "userId");

-- CreateIndex
CREATE INDEX "zones_siteId_idx" ON "zones"("siteId");

-- CreateIndex
CREATE INDEX "zones_code_idx" ON "zones"("code");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_code_key" ON "equipment"("code");

-- CreateIndex
CREATE INDEX "equipment_code_idx" ON "equipment"("code");

-- CreateIndex
CREATE INDEX "equipment_type_idx" ON "equipment"("type");

-- CreateIndex
CREATE INDEX "equipment_status_idx" ON "equipment"("status");

-- CreateIndex
CREATE INDEX "equipment_siteId_idx" ON "equipment"("siteId");

-- CreateIndex
CREATE INDEX "equipment_zoneId_idx" ON "equipment"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "anomalies_code_key" ON "anomalies"("code");

-- CreateIndex
CREATE INDEX "anomalies_code_idx" ON "anomalies"("code");

-- CreateIndex
CREATE INDEX "anomalies_severity_idx" ON "anomalies"("severity");

-- CreateIndex
CREATE INDEX "anomalies_status_idx" ON "anomalies"("status");

-- CreateIndex
CREATE INDEX "anomalies_priority_idx" ON "anomalies"("priority");

-- CreateIndex
CREATE INDEX "anomalies_category_idx" ON "anomalies"("category");

-- CreateIndex
CREATE INDEX "anomalies_equipmentId_idx" ON "anomalies"("equipmentId");

-- CreateIndex
CREATE INDEX "anomalies_assignedToId_idx" ON "anomalies"("assignedToId");

-- CreateIndex
CREATE INDEX "anomalies_assignedTeamId_idx" ON "anomalies"("assignedTeamId");

-- CreateIndex
CREATE INDEX "anomalies_reportedById_idx" ON "anomalies"("reportedById");

-- CreateIndex
CREATE INDEX "anomalies_reportedAt_idx" ON "anomalies"("reportedAt");

-- CreateIndex
CREATE INDEX "anomalies_dueDate_idx" ON "anomalies"("dueDate");

-- CreateIndex
CREATE INDEX "comments_anomalyId_idx" ON "comments"("anomalyId");

-- CreateIndex
CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");

-- CreateIndex
CREATE INDEX "comments_createdAt_idx" ON "comments"("createdAt");

-- CreateIndex
CREATE INDEX "attachments_anomalyId_idx" ON "attachments"("anomalyId");

-- CreateIndex
CREATE INDEX "attachments_rexId_idx" ON "attachments"("rexId");

-- CreateIndex
CREATE INDEX "attachments_uploadedById_idx" ON "attachments"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_tasks_code_key" ON "maintenance_tasks"("code");

-- CreateIndex
CREATE INDEX "maintenance_tasks_code_idx" ON "maintenance_tasks"("code");

-- CreateIndex
CREATE INDEX "maintenance_tasks_type_idx" ON "maintenance_tasks"("type");

-- CreateIndex
CREATE INDEX "maintenance_tasks_status_idx" ON "maintenance_tasks"("status");

-- CreateIndex
CREATE INDEX "maintenance_tasks_priority_idx" ON "maintenance_tasks"("priority");

-- CreateIndex
CREATE INDEX "maintenance_tasks_assignedTeamId_idx" ON "maintenance_tasks"("assignedTeamId");

-- CreateIndex
CREATE INDEX "maintenance_tasks_assignedToId_idx" ON "maintenance_tasks"("assignedToId");

-- CreateIndex
CREATE INDEX "maintenance_tasks_startDate_idx" ON "maintenance_tasks"("startDate");

-- CreateIndex
CREATE INDEX "maintenance_tasks_endDate_idx" ON "maintenance_tasks"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "rex_entries_code_key" ON "rex_entries"("code");

-- CreateIndex
CREATE INDEX "rex_entries_code_idx" ON "rex_entries"("code");

-- CreateIndex
CREATE INDEX "rex_entries_status_idx" ON "rex_entries"("status");

-- CreateIndex
CREATE INDEX "rex_entries_category_idx" ON "rex_entries"("category");

-- CreateIndex
CREATE INDEX "rex_entries_knowledgeValue_idx" ON "rex_entries"("knowledgeValue");

-- CreateIndex
CREATE INDEX "rex_entries_createdById_idx" ON "rex_entries"("createdById");

-- CreateIndex
CREATE INDEX "rex_entries_anomalyId_idx" ON "rex_entries"("anomalyId");

-- CreateIndex
CREATE INDEX "rex_entries_createdAt_idx" ON "rex_entries"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_category_idx" ON "system_settings"("category");

-- CreateIndex
CREATE INDEX "system_settings_key_idx" ON "system_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_key" ON "notification_settings"("userId");

-- CreateIndex
CREATE INDEX "kpi_metrics_name_idx" ON "kpi_metrics"("name");

-- CreateIndex
CREATE INDEX "kpi_metrics_category_idx" ON "kpi_metrics"("category");

-- CreateIndex
CREATE INDEX "kpi_metrics_period_idx" ON "kpi_metrics"("period");

-- CreateIndex
CREATE INDEX "kpi_metrics_calculatedAt_idx" ON "kpi_metrics"("calculatedAt");

-- CreateIndex
CREATE INDEX "kpi_metrics_siteId_idx" ON "kpi_metrics"("siteId");

-- CreateIndex
CREATE INDEX "reports_type_idx" ON "reports"("type");

-- CreateIndex
CREATE INDEX "reports_generatedBy_idx" ON "reports"("generatedBy");

-- CreateIndex
CREATE INDEX "reports_generatedAt_idx" ON "reports"("generatedAt");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anomalies" ADD CONSTRAINT "anomalies_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anomalies" ADD CONSTRAINT "anomalies_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anomalies" ADD CONSTRAINT "anomalies_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anomalies" ADD CONSTRAINT "anomalies_assignedTeamId_fkey" FOREIGN KEY ("assignedTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_anomalyId_fkey" FOREIGN KEY ("anomalyId") REFERENCES "anomalies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_anomalyId_fkey" FOREIGN KEY ("anomalyId") REFERENCES "anomalies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_rexId_fkey" FOREIGN KEY ("rexId") REFERENCES "rex_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_tasks" ADD CONSTRAINT "maintenance_tasks_assignedTeamId_fkey" FOREIGN KEY ("assignedTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rex_entries" ADD CONSTRAINT "rex_entries_anomalyId_fkey" FOREIGN KEY ("anomalyId") REFERENCES "anomalies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
