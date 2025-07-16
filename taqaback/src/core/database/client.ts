import { PrismaClient } from '@prisma/client';
import { createLogger } from '../utils/logger';

const logger = createLogger('Database');

/**
 * Global database client instance
 */
let prismaClient: PrismaClient | null = null;

/**
 * Get the Prisma database client
 */
export function getDatabaseClient(): PrismaClient {
  if (!prismaClient) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    // Log successful connection
    prismaClient.$connect()
      .then(() => {
        logger.info('Database connected successfully using connection pool');
      })
      .catch((error) => {
        logger.error('Failed to connect to database:', error);
    });
  }
  
  return prismaClient;
}

/**
 * Close the database connection
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
    logger.info('Database connection closed');
  }
}

/**
 * Test the database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = getDatabaseClient();
    await client.$queryRaw`SELECT 1`;
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Direct export for convenience
 */
export const prisma = getDatabaseClient(); 