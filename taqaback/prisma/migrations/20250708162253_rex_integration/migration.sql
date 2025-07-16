-- AlterTable
ALTER TABLE "rex_entries" ADD COLUMN     "building" TEXT,
ADD COLUMN     "comments" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "effectiveness" INTEGER,
ADD COLUMN     "equipment" TEXT,
ADD COLUMN     "summary" TEXT,
ALTER COLUMN "status" SET DEFAULT 'draft';

-- AddForeignKey
ALTER TABLE "rex_entries" ADD CONSTRAINT "rex_entries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rex_entries" ADD CONSTRAINT "rex_entries_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
