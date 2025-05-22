// PaymentProcessorLogger.ts - Logging implementation

/**
 * Simple logger interface
 */
export interface Logger {
  debug(message: string, meta?: Record<string, any>): void;
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
}

/**
 * Console logger implementation
 */
export class ConsoleLogger implements Logger {
  private readonly namespace: string;

  /**
   * Creates a new console logger
   * @param namespace - Logger namespace
   */
  constructor(namespace: string = 'PaymentProcessor') {
    this.namespace = namespace;
  }

  /**
   * Formats a log message with metadata
   * @param level - Log level
   * @param message - Log message
   * @param meta - Log metadata
   * @returns Formatted log message
   */
  private formatMessage(level: string, message: string, meta?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] [${this.namespace}] ${message}${metaString}`;
  }

  /**
   * Logs a debug message
   * @param message - Log message
   * @param meta - Log metadata
   */
  debug(message: string, meta?: Record<string, any>): void {
    console.debug(this.formatMessage('DEBUG', message, meta));
  }

  /**
   * Logs an info message
   * @param message - Log message
   * @param meta - Log metadata
   */
  info(message: string, meta?: Record<string, any>): void {
    console.info(this.formatMessage('INFO', message, meta));
  }

  /**
   * Logs a warning message
   * @param message - Log message
   * @param meta - Log metadata
   */
  warn(message: string, meta?: Record<string, any>): void {
    console.warn(this.formatMessage('WARN', message, meta));
  }

  /**
   * Logs an error message
   * @param message - Log message
   * @param meta - Log metadata
   */
  error(message: string, meta?: Record<string, any>): void {
    console.error(this.formatMessage('ERROR', message, meta));
  }
}

/**
 * Standard logger instance for the PaymentProcessor component
 */
export const logger: Logger = new ConsoleLogger('PaymentProcessor');