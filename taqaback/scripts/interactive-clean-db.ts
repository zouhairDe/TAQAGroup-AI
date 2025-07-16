/**
 * Interactive Database Cleanup Script
 * 
 * This script provides an interactive way to clean the database with confirmation steps
 * to prevent accidental data deletion.
 * 
 * Run with: npx ts-node scripts/interactive-clean-db.ts
 */

import { PrismaClient } from '@prisma/client';
import { createLogger } from '../src/core/utils/logger';
import readline from 'readline';
import { cleanDb } from './clean-db';

const logger = createLogger('DB-Interactive-Cleanup');
const prisma = new PrismaClient();

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function getTableCounts(): Promise<Record<string, number>> {
  const tables = {
    'anomalies': await prisma.anomaly.count(),
    'users': await prisma.user.count(),
    'equipment': await prisma.equipment.count(),
    'teams': await prisma.team.count(),
    'comments': await prisma.comment.count(),
    'attachments': await prisma.attachment.count(),
    'maintenance tasks': await prisma.maintenanceTask.count(),
    'slots': await prisma.slot.count(),
    'rex entries': await prisma.rEXEntry.count(),
    'bronze anomalies': await prisma.bronzeAnomaliesRaw.count(),
  };
  return tables;
}

async function interactiveCleanup() {
  console.log('\n');
  console.log('🔴 TAQA DATABASE CLEANUP UTILITY 🔴');
  console.log('==================================');
  console.log('This script will DELETE ALL DATA from your database.');
  console.log('This operation CANNOT be undone without a backup.');
  console.log('\n');
  
  try {
    // Show current database stats
    console.log('Current database statistics:');
    const counts = await getTableCounts();
    
    for (const [table, count] of Object.entries(counts)) {
      console.log(`- ${table}: ${count} records`);
    }
    
    console.log('\n');
    
    // Get environment confirmation
    const dbUrl = process.env.DATABASE_URL || 'unknown';
    const dbName = dbUrl.split('/').pop()?.split('?')[0] || 'unknown';
    
    console.log(`Connected database: ${dbName}`);
    console.log('\n');

    // First confirmation
    await new Promise<void>((resolve, reject) => {
      rl.question('Type the name of the database to confirm cleanup: ', (answer) => {
        if (answer.toLowerCase() === dbName.toLowerCase()) {
          resolve();
        } else {
          console.log('❌ Database name does not match. Operation cancelled.');
          reject(new Error('Database name confirmation failed'));
        }
      });
    });

    // Second confirmation with a specific phrase
    await new Promise<void>((resolve, reject) => {
      rl.question('\nType "YES, DELETE ALL DATA" to confirm: ', (answer) => {
        if (answer === 'YES, DELETE ALL DATA') {
          resolve();
        } else {
          console.log('❌ Confirmation phrase does not match. Operation cancelled.');
          reject(new Error('Confirmation phrase failed'));
        }
      });
    });

    console.log('\n⚠️ Proceeding with database cleanup...');
    
    // Call the main cleanup function
    await cleanDb();
    
    console.log('\n✅ Database has been successfully cleaned!');
    
    // Verify the cleanup
    const newCounts = await getTableCounts();
    console.log('\nVerification - new database statistics:');
    
    for (const [table, count] of Object.entries(newCounts)) {
      console.log(`- ${table}: ${count} records`);
    }
    
  } catch (error) {
    console.error('\n❌ Database cleanup aborted:', error instanceof Error ? error.message : 'Unknown error');
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  interactiveCleanup()
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    })
    .finally(() => {
      process.exit(0);
    });
}
