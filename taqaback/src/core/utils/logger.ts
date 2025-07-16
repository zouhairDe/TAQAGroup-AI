/**
 * Simple logger utility for the application
 */
import chalk from 'chalk';

export interface Logger {
  info(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
}

/**
 * Create a logger instance for a specific context
 * @param context - The context or module name for the logger
 * @returns Logger instance
 */
export function createLogger(context: string): Logger {
  const logLevel: string = process.env.LOG_LEVEL || 'info';
  
  function shouldLog(level: string): boolean {
    const levels: Record<string, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    return levels[level] >= levels[logLevel];
  }
  
  function formatMessage(level: string, message: string): string {
    const timestamp: string = new Date().toISOString();
    const levelTag: string =
      level === 'info' ? chalk.blueBright('[INFO]') :
      level === 'warn' ? chalk.yellow('[WARN]') :
      level === 'error' ? chalk.red('[ERROR]') :
      chalk.gray('[DEBUG]');
    const contextTag: string = chalk.magenta(`[${context}]`);
    return `${chalk.gray(`[${timestamp}]`)} ${levelTag} ${contextTag} ${message}`;
  }
  
  function printErrorDetails(error: unknown): void {
    if (error instanceof Error) {
      console.error(chalk.red(error.stack || error.message));
    } else if (typeof error === 'object' && error !== null) {
      console.error(chalk.red(JSON.stringify(error, null, 2)));
    } else {
      console.error(chalk.red(String(error)));
    }
  }
  
  return {
    /**
     * Log an info message
     */
    info(message: string, ...args: unknown[]): void {
      if (shouldLog('info')) {
        console.log(formatMessage('info', message), ...args);
      }
    },
    
    /**
     * Log an error message, with stack trace if available
     */
    error(message: string, ...args: unknown[]): void {
      if (shouldLog('error')) {
        console.error(formatMessage('error', message));
        args.forEach(printErrorDetails);
      }
    },
    
    /**
     * Log a warning message
     */
    warn(message: string, ...args: unknown[]): void {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', message), ...args);
      }
    },
    
    /**
     * Log a debug message
     */
    debug(message: string, ...args: unknown[]): void {
      if (shouldLog('debug')) {
        console.debug(formatMessage('debug', message), ...args);
      }
    }
  };
} 