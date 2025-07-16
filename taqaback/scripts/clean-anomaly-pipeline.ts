/**
 * Test script for clean-up of the anomaly processing pipeline
 * 
 * Run with: npx ts-node scripts/clean-anomaly-pipeline.ts
 */

import { PrismaClient } from '@prisma/client';
import { createLogger } from '../src/core/utils/logger';

const logger = createLogger('Anomaly-Pipeline-Cleanup');
const prisma = new PrismaClient();

// Export the function so it can be imported in other scripts
export async function cleanAnomalyPipeline() {
  logger.info('🧹 Starting anomaly pipeline cleanup...');
    try {
    // Delete data in a specific order without disabling constraints
    logger.info('Cleaning anomaly processing tables...');
    
    // Instead of using session_replication_role, we'll delete in the correct order
    
    // First clean gold layer (anomalies)
    logger.info('Cleaning anomaly actions...');
    await prisma.anomalyAction.deleteMany({
      where: {
        anomaly: {
          origin: 'csv_import'
        }
      }
    });
    
    logger.info('Cleaning slots...');
    await prisma.slot.deleteMany({
      where: {
        anomaly: {
          origin: 'csv_import'
        }
      }
    });
    
    logger.info('Cleaning comments...');
    await prisma.comment.deleteMany({
      where: {
        anomaly: {
          origin: 'csv_import'
        }
      }
    });
    
    logger.info('Cleaning attachments...');
    await prisma.attachment.deleteMany({
      where: {
        anomaly: {
          origin: 'csv_import'
        }
      }
    });
    
    logger.info('Cleaning anomalies...');
    await prisma.anomaly.deleteMany({
      where: { origin: 'csv_import' }
    });
    
    // Then silver layer
    logger.info('Cleaning silver layer...');
    await prisma.silverAnomaliesClean.deleteMany();
    
    // Then bronze layer
    logger.info('Cleaning bronze layer...');
    await prisma.bronzeAnomaliesRaw.deleteMany();
    
    // Then logs
    logger.info('Cleaning data processing logs...');
    await prisma.dataProcessingLog.deleteMany({
      where: {
        OR: [
          { jobName: 'bronze_to_silver_anomalies' },
          { jobName: 'silver_to_gold_anomalies' }
        ]
      }
    });
    
    logger.info('✅ Anomaly pipeline cleanup completed successfully!');
    
  } catch (error) {
    logger.error('❌ Error cleaning anomaly pipeline:', error instanceof Error ? error.message : 'Unknown error');
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  cleanAnomalyPipeline()
    .then(() => {
      console.log('Anomaly pipeline cleanup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error during anomaly pipeline cleanup:', error);
      process.exit(1);
    });
}