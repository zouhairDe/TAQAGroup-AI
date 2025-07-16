-- CreateTable
CREATE TABLE "slots" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "anomalyId" TEXT NOT NULL,
    "dates" TIMESTAMP(3)[],
    "estimatedDuration" INTEGER,
    "actualDuration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "priority" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "assignedTeamId" TEXT,
    "assignedToId" TEXT,
    "windowType" TEXT NOT NULL,
    "downtime" BOOLEAN NOT NULL DEFAULT false,
    "safetyPrecautions" TEXT[],
    "resourcesNeeded" TEXT[],
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "productionImpact" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "completionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "slots_code_key" ON "slots"("code");

-- CreateIndex
CREATE INDEX "slots_code_idx" ON "slots"("code");

-- CreateIndex
CREATE INDEX "slots_anomalyId_idx" ON "slots"("anomalyId");

-- CreateIndex
CREATE INDEX "slots_createdById_idx" ON "slots"("createdById");

-- CreateIndex
CREATE INDEX "slots_assignedTeamId_idx" ON "slots"("assignedTeamId");

-- CreateIndex
CREATE INDEX "slots_assignedToId_idx" ON "slots"("assignedToId");

-- CreateIndex
CREATE INDEX "slots_status_idx" ON "slots"("status");

-- CreateIndex
CREATE INDEX "slots_priority_idx" ON "slots"("priority");

-- CreateIndex
CREATE INDEX "slots_dates_idx" ON "slots"("dates");

-- CreateIndex
CREATE INDEX "slots_createdAt_idx" ON "slots"("createdAt");

-- CreateIndex
CREATE INDEX "slots_windowType_idx" ON "slots"("windowType");

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_anomalyId_fkey" FOREIGN KEY ("anomalyId") REFERENCES "anomalies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_assignedTeamId_fkey" FOREIGN KEY ("assignedTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
