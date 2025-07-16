/*
  Warnings:

  - You are about to drop the column `comments` on the `rex_entries` table. All the data in the column will be lost.
  - You are about to drop the column `equipment` on the `rex_entries` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `rex_entries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "helpful" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rexId" TEXT,
ALTER COLUMN "anomalyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "rex_entries" DROP COLUMN "comments",
DROP COLUMN "equipment",
DROP COLUMN "summary",
ADD COLUMN     "impactLevel" TEXT,
ALTER COLUMN "status" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "comments_rexId_idx" ON "comments"("rexId");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_rexId_fkey" FOREIGN KEY ("rexId") REFERENCES "rex_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
