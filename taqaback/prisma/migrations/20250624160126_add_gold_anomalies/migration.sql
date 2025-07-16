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
CREATE TABLE "bronze_equipment_raw" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "section" TEXT,
    "raw_data" JSONB,
    "ingested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "is_processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "bronze_equipment_raw_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "silver_equipment_clean" (
    "id" TEXT NOT NULL,
    "equipment_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "bronze_source_id" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "silver_equipment_clean_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "silver_sections_clean" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "department" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "silver_sections_clean_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "gold_equipment_health" (
    "id" TEXT NOT NULL,
    "equipment_number" TEXT NOT NULL,
    "equipment_category" TEXT NOT NULL,
    "section_code" TEXT NOT NULL,
    "report_period" TEXT NOT NULL,
    "total_anomalies" INTEGER NOT NULL,
    "critical_anomalies" INTEGER NOT NULL,
    "avg_time_to_detection" DOUBLE PRECISION,
    "avg_time_to_resolution" DOUBLE PRECISION,
    "health_score" DOUBLE PRECISION NOT NULL,
    "reliability_score" DOUBLE PRECISION NOT NULL,
    "maintenance_index" DOUBLE PRECISION NOT NULL,
    "risk_level" TEXT NOT NULL,
    "predicted_failure_date" TIMESTAMP(3),
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_as_of" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gold_equipment_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gold_section_performance" (
    "id" TEXT NOT NULL,
    "section_code" TEXT NOT NULL,
    "section_name" TEXT NOT NULL,
    "report_period" TEXT NOT NULL,
    "total_equipment" INTEGER NOT NULL,
    "equipment_with_issues" INTEGER NOT NULL,
    "total_anomalies" INTEGER NOT NULL,
    "critical_anomalies" INTEGER NOT NULL,
    "overall_health_score" DOUBLE PRECISION NOT NULL,
    "availability_rate" DOUBLE PRECISION NOT NULL,
    "maintenance_efficiency" DOUBLE PRECISION NOT NULL,
    "cost_per_anomaly" DOUBLE PRECISION,
    "health_trend" TEXT NOT NULL,
    "anomaly_trend" TEXT NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_as_of" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gold_section_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_processing_logs" (
    "id" TEXT NOT NULL,
    "job_name" TEXT NOT NULL,
    "source_layer" TEXT NOT NULL,
    "target_layer" TEXT NOT NULL,
    "records_processed" INTEGER NOT NULL,
    "records_succeeded" INTEGER NOT NULL,
    "records_failed" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "metadata" JSONB,

    CONSTRAINT "data_processing_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bronze_anomalies_raw_ingested_at_idx" ON "bronze_anomalies_raw"("ingested_at");

-- CreateIndex
CREATE INDEX "bronze_anomalies_raw_is_processed_idx" ON "bronze_anomalies_raw"("is_processed");

-- CreateIndex
CREATE INDEX "bronze_anomalies_raw_num_equipement_idx" ON "bronze_anomalies_raw"("num_equipement");

-- CreateIndex
CREATE INDEX "bronze_equipment_raw_ingested_at_idx" ON "bronze_equipment_raw"("ingested_at");

-- CreateIndex
CREATE INDEX "bronze_equipment_raw_is_processed_idx" ON "bronze_equipment_raw"("is_processed");

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
CREATE UNIQUE INDEX "silver_equipment_clean_equipment_number_key" ON "silver_equipment_clean"("equipment_number");

-- CreateIndex
CREATE INDEX "silver_equipment_clean_section_idx" ON "silver_equipment_clean"("section");

-- CreateIndex
CREATE INDEX "silver_equipment_clean_category_idx" ON "silver_equipment_clean"("category");

-- CreateIndex
CREATE INDEX "silver_equipment_clean_status_idx" ON "silver_equipment_clean"("status");

-- CreateIndex
CREATE UNIQUE INDEX "silver_sections_clean_code_key" ON "silver_sections_clean"("code");

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
CREATE INDEX "gold_equipment_health_equipment_number_idx" ON "gold_equipment_health"("equipment_number");

-- CreateIndex
CREATE INDEX "gold_equipment_health_section_code_idx" ON "gold_equipment_health"("section_code");

-- CreateIndex
CREATE INDEX "gold_equipment_health_report_period_idx" ON "gold_equipment_health"("report_period");

-- CreateIndex
CREATE INDEX "gold_equipment_health_health_score_idx" ON "gold_equipment_health"("health_score");

-- CreateIndex
CREATE INDEX "gold_equipment_health_risk_level_idx" ON "gold_equipment_health"("risk_level");

-- CreateIndex
CREATE UNIQUE INDEX "gold_equipment_health_equipment_number_report_period_key" ON "gold_equipment_health"("equipment_number", "report_period");

-- CreateIndex
CREATE INDEX "gold_section_performance_section_code_idx" ON "gold_section_performance"("section_code");

-- CreateIndex
CREATE INDEX "gold_section_performance_report_period_idx" ON "gold_section_performance"("report_period");

-- CreateIndex
CREATE INDEX "gold_section_performance_overall_health_score_idx" ON "gold_section_performance"("overall_health_score");

-- CreateIndex
CREATE INDEX "gold_section_performance_health_trend_idx" ON "gold_section_performance"("health_trend");

-- CreateIndex
CREATE UNIQUE INDEX "gold_section_performance_section_code_report_period_key" ON "gold_section_performance"("section_code", "report_period");

-- CreateIndex
CREATE INDEX "data_processing_logs_job_name_idx" ON "data_processing_logs"("job_name");

-- CreateIndex
CREATE INDEX "data_processing_logs_start_time_idx" ON "data_processing_logs"("start_time");

-- CreateIndex
CREATE INDEX "data_processing_logs_status_idx" ON "data_processing_logs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "silver_equipment_clean" ADD CONSTRAINT "silver_equipment_clean_section_fkey" FOREIGN KEY ("section") REFERENCES "silver_sections_clean"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
