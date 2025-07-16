/**
 * Partial Database Reset Script
 * 
 * This script will clean most tables but preserve admin users, system settings,
 * and core configuration data. It's useful for resetting application data while
 * maintaining system configuration.
 * 
 * Run with: npx ts-node scripts/reset-app-data.ts
 */

import { PrismaClient } from '@prisma/client';
import { createLogger } from '../src/core/utils/logger';

const logger = createLogger('DB-Partial-Reset');
const prisma = new PrismaClient();

async function resetAppData() {
  logger.info('🔄 Starting application data reset...');
    try {
    // Note: We're not disabling foreign key constraints, but deleting in the correct order
    logger.info('Starting data deletion in dependency order (respecting foreign key constraints)');

    // Delete data in a specific order, but preserve admin users and system settings
    
    // Delete application data
    logger.info('Cleaning application data tables...');
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
    
    // Delete non-admin users and their related data
    logger.info('Preserving admin users, deleting other users...');
    
    // Find non-admin users
    const nonAdminUsers = await prisma.user.findMany({
      where: {
        NOT: {
          role: {
            in: ['admin', 'Website Admin']
          }
        }
      },
      select: { id: true }
    });
    
    const nonAdminUserIds = nonAdminUsers.map(user => user.id);
    
    // Delete related data for non-admin users
    if (nonAdminUserIds.length > 0) {
      await prisma.teamMember.deleteMany({
        where: { userId: { in: nonAdminUserIds } }
      });
      
      await prisma.userProfile.deleteMany({
        where: { userId: { in: nonAdminUserIds } }
      });
      
      await prisma.notificationSetting.deleteMany({
        where: { userId: { in: nonAdminUserIds } }
      });
      
      // Finally delete the non-admin users
      await prisma.user.deleteMany({
        where: { id: { in: nonAdminUserIds } }
      });
    }
    
    // Clean data processing related tables
    logger.info('Cleaning data processing tables...');
    await prisma.dataProcessingLog.deleteMany();
    await prisma.silverAnomaliesClean.deleteMany();
    await prisma.bronzeAnomaliesRaw.deleteMany();
    
    // Preserve but reset teams
    logger.info('Resetting teams...');
    await prisma.team.updateMany({
      data: { 
        rating: null
      }
    });    logger.info('✅ Application data reset completed successfully!');
  } catch (error) {
    logger.error('❌ Error resetting application data:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Allow running as a standalone script
if (require.main === module) {
  resetAppData()
    .then(() => {
      console.log('Application data reset completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error during application data reset:', error);
      process.exit(1);
    });
} else {
  // Export for use in other scripts
  module.exports = { resetAppData };
}
