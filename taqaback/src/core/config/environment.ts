import dotenv from 'dotenv';

/**
 * Load and validate environment variables
 */
export function loadEnvironmentVariables(): void {
  dotenv.config();
  
  validateRequiredEnvironmentVariables();
}

/**
 * Validate that all required environment variables are present
 */
function validateRequiredEnvironmentVariables(): void {
  const requiredVariables: string[] = [
    'DATABASE_URL',
    'DIRECT_DATABASE_URL',
    'JWT_SECRET'
  ];
  
  const missingVariables: string[] = requiredVariables.filter(
    (variable: string): boolean => !process.env[variable]
  );
  
  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(', ')}`
    );
  }
}

/**
 * Get environment configuration
 */
export interface EnvironmentConfig {
  readonly nodeEnv: string;
  readonly port: number;
  readonly host: string;
  readonly databaseUrl: string;
  readonly directDatabaseUrl: string;
  readonly logLevel: string;
  readonly corsOrigin: string;
  readonly jwtSecret: string;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3333', 10),
    host: process.env.HOST || '0.0.0.0',
    databaseUrl: process.env.DATABASE_URL!,
    directDatabaseUrl: process.env.DIRECT_DATABASE_URL!,
    logLevel: process.env.LOG_LEVEL || 'info',
    corsOrigin: "*",
    jwtSecret: process.env.JWT_SECRET!
  };
} 