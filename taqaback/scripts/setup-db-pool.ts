/**
 * Database Pool Setup and Testing Script
 * 
 * This script helps you set up and test your DigitalOcean connection pool
 * Run with: npm run db:pool-test
 */

import { PrismaClient } from '@prisma/client';
import { createLogger } from '../src/core/utils/logger';

const logger = createLogger('DB-Pool-Setup');

interface ConnectionInfo {
  pooledUrl: string;
  directUrl: string;
  poolMode: string;
  poolSize: number;
}

//Uncomment this when you have the connection info
// const connectionInfo: ConnectionInfo = {
//   pooledUrl: "link here",
//   directUrl: "link here",
//   poolMode: 'Transaction',
//   poolSize: 10
// };

async function testPooledConnection(): Promise<boolean> {
  logger.info('Testing pooled connection...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionInfo.pooledUrl,
      },
    },
  });

  try {
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    logger.info('✅ Pooled connection successful');
    
    // Test user query (should work with your existing schema)
    const userCount = await prisma.user.count();
    logger.info(`✅ Users in database: ${userCount}`);
    
    // Test multiple concurrent connections (simulate load)
    logger.info('Testing concurrent connections...');
    const promises = Array.from({ length: 5 }, (_, i) => 
      prisma.$queryRaw`SELECT ${i + 1} as connection_test`
    );
    
    await Promise.all(promises);
    logger.info('✅ Concurrent connections successful');
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    logger.error('❌ Pooled connection failed:', error);
    await prisma.$disconnect();
    return false;
  }
}

async function testDirectConnection(): Promise<boolean> {
  logger.info('Testing direct connection...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionInfo.directUrl,
      },
    },
  });

  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    logger.info('✅ Direct connection successful');
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    logger.error('❌ Direct connection failed:', error);
    await prisma.$disconnect();
    return false;
  }
}

async function generateEnvConfiguration(): Promise<void> {
  logger.info('\n📋 Environment Configuration:');
  logger.info('Create a .env file in your backend directory with:');
  logger.info('');
  logger.info('# =============================================================================');
  logger.info('# DATABASE CONFIGURATION');
  logger.info('# =============================================================================');
  logger.info('');
  logger.info('# Use the pooled connection URL from DigitalOcean');
  logger.info(`DATABASE_URL="${connectionInfo.pooledUrl}"`);
  logger.info('');
  logger.info('# For migrations and schema operations, use direct database connection');
  logger.info('# (PgBouncer pools don\'t support all Prisma operations)');
  logger.info(`DIRECT_DATABASE_URL="${connectionInfo.directUrl}"`);
  logger.info('');
  logger.info('# =============================================================================');
  logger.info('# SERVER CONFIGURATION');
  logger.info('# =============================================================================');
  logger.info('');
  logger.info('NODE_ENV="development"');
  logger.info('PORT="3333"');
  logger.info('HOST="0.0.0.0"');
  logger.info('LOG_LEVEL="info"');
  logger.info('CORS_ORIGIN="http://localhost:3333"');
  logger.info('');
  logger.info('# =============================================================================');
  logger.info('# AUTHENTICATION');
  logger.info('# =============================================================================');
  logger.info('');
  logger.info('JWT_SECRET="your-super-secret-jwt-key-change-in-production"');
  logger.info('JWT_EXPIRES_IN="7d"');
}

async function displayPoolInfo(): Promise<void> {
  logger.info('\n🏊 Connection Pool Information:');
  logger.info('=====================================');
  logger.info(`Pool Name: MainPool`);
  logger.info(`Pool Mode: ${connectionInfo.poolMode}`);
  logger.info(`Pool Size: ${connectionInfo.poolSize} connections`);
  logger.info(`Database: taqathon`);
  logger.info('');
  logger.info('🔍 Pool Mode Benefits:');
  logger.info('- Transaction Mode: Each transaction gets a connection');
  logger.info('- Connections are released after each transaction completes');
  logger.info('- Optimal for web applications with short-lived operations');
  logger.info('- Up to 5000 client connections can share 10 backend connections');
}

async function main(): Promise<void> {
  logger.info('🚀 TAQA Database Pool Setup & Testing');
  logger.info('=====================================\n');

  await displayPoolInfo();
  
  // Test connections
  const pooledResult = await testPooledConnection();
  const directResult = await testDirectConnection();
  
  if (pooledResult && directResult) {
    logger.info('\n🎉 All connection tests passed!');
    logger.info('Your database pool is ready to use.');
  } else {
    logger.error('\n❌ Some connection tests failed.');
    logger.error('Please check your connection URLs and database configuration.');
  }
  
  await generateEnvConfiguration();
  
  logger.info('\n📚 Next Steps:');
  logger.info('1. Copy the environment configuration above to your .env file');
  logger.info('2. Run: npm run db:generate');
  logger.info('3. Run: npm run dev');
  logger.info('4. Monitor your pool usage in DigitalOcean dashboard');
}

// Handle script execution
if (require.main === module) {
  main()
    .catch((error) => {
      logger.error('Script failed:', error);
      process.exit(1);
    })
    .finally(() => {
      process.exit(0);
    });
} 