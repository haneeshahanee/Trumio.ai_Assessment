import * as fs from 'fs';
import * as path from 'path';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'STEP';

const LOG_DIR = path.resolve(process.cwd(), 'logs');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_FILE = path.join(LOG_DIR, `test-run-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.log`);

function getTimestamp(): string {
  return new Date().toISOString();
}

function colorize(level: LogLevel, message: string): string {
  const colors: Record<LogLevel, string> = {
    INFO:  '\x1b[36m',  // Cyan
    WARN:  '\x1b[33m',  // Yellow
    ERROR: '\x1b[31m',  // Red
    DEBUG: '\x1b[90m',  // Gray
    STEP:  '\x1b[32m',  // Green
  };
  const reset = '\x1b[0m';
  return `${colors[level]}[${level}]${reset} ${message}`;
}

function writeToFile(level: LogLevel, message: string): void {
  const logEntry = `${getTimestamp()} [${level}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
}

function log(level: LogLevel, message: string, context?: string): void {
  const contextStr = context ? ` [${context}]` : '';
  const fullMessage = `${getTimestamp()}${contextStr} ${message}`;
  console.log(colorize(level, `${contextStr} ${message}`));
  writeToFile(level, fullMessage);
}

export const logger = {
  info: (message: string, context?: string) => log('INFO', message, context),
  warn: (message: string, context?: string) => log('WARN', message, context),
  error: (message: string, context?: string) => log('ERROR', message, context),
  debug: (message: string, context?: string) => log('DEBUG', message, context),
  step: (message: string, context?: string) => log('STEP', `▶ ${message}`, context),
  
  testStart: (testName: string) => {
    const separator = '='.repeat(60);
    console.log(`\x1b[35m${separator}\x1b[0m`);
    log('INFO', `TEST STARTED: ${testName}`);
    console.log(`\x1b[35m${separator}\x1b[0m`);
  },

  testEnd: (testName: string, passed: boolean) => {
    const status = passed ? '\x1b[32m✓ PASSED\x1b[0m' : '\x1b[31m✗ FAILED\x1b[0m';
    console.log(`${status} - ${testName}`);
    log(passed ? 'INFO' : 'ERROR', `TEST ${passed ? 'PASSED' : 'FAILED'}: ${testName}`);
  },

  logFile: LOG_FILE,
};
