/**
 * Database Cleanup Script
 * 
 * This script will clean all data from the database, effectively resetting it to an empty state.
 * CAUTION: This will delete ALL data from ALL tables in the database. Use with care!
 * 
 * Run with: npx ts-node scripts/clean-db.ts
 */

import { PrismaClient } from '@prisma/client';
import { createLogger } from '../src/core/utils/logger';

const logger = createLogger('DB-Cleanup');
const prisma = new PrismaClient();

async function cleanDb() {
  logger.info('🧹 Starting database cleanup...');
  try {
    // Note: We're not disabling foreign key constraints, but deleting in the correct order
    logger.info('Starting data deletion in dependency order (respecting foreign key constraints)');

    // Delete data in a specific order to avoid foreign key constraint issues
    
    // First delete from tables with many foreign key dependencies
    logger.info('Cleaning tables with relation dependencies...');
    await prisma.kPIMetric.deleteMany();
    await prisma.rEXEntry.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.anomalyAction.deleteMany();
    await prisma.fileStorage.deleteMany();
    await prisma.slot.deleteMany();
    await prisma.maintenanceTask.deleteMany();
    await prisma.maintenancePeriod.deleteMany();
    await prisma.anomaly.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
    await prisma.equipment.deleteMany();
    await prisma.zone.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.notificationSetting.deleteMany();
    await prisma.report.deleteMany();
    await prisma.systemSetting.deleteMany();
    
    // Then delete from tables that are referenced by others
    logger.info('Cleaning core tables...');
    await prisma.user.deleteMany();
    await prisma.site.deleteMany();
    await prisma.department.deleteMany();
    
    // Clean data processing related tables
    logger.info('Cleaning data processing tables...');
    await prisma.dataProcessingLog.deleteMany();
    await prisma.silverAnomaliesClean.deleteMany();
    await prisma.bronzeAnomaliesRaw.deleteMany();
    
    logger.info('✅ Database cleanup completed successfully!');
  } catch (error) {
    logger.error('❌ Error cleaning database:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Allow running as a standalone script
if (require.main === module) {
  cleanDb()
    .then(() => {
      console.log('Database cleanup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error during database cleanup:', error);
      process.exit(1);
    });
} else {
  // Export for use in other scripts
  module.exports = { cleanDb };
}
