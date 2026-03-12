// ──────────────────────────────────────────────
// Logger — structured console logging with
// timestamps, levels and JSON payloads.
// ──────────────────────────────────────────────

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export class Logger {
  constructor(private readonly context: string) {}

  private format(level: LogLevel, message: string, data?: unknown): string {
    const ts = new Date().toISOString();
    const base = `[${ts}] [${level}] [${this.context}] ${message}`;
    if (data !== undefined) {
      try {
        return `${base}\n  ${JSON.stringify(data, null, 2)}`;
      } catch {
        return `${base}\n  [unserializable data]`;
      }
    }
    return base;
  }

  info(message: string, data?: unknown): void {
    console.log(this.format('INFO', message, data));
  }

  warn(message: string, data?: unknown): void {
    console.warn(this.format('WARN', message, data));
  }

  error(message: string, data?: unknown): void {
    console.error(this.format('ERROR', message, data));
  }

  debug(message: string, data?: unknown): void {
    if (process.env.DEBUG) {
      console.debug(this.format('DEBUG', message, data));
    }
  }

  step(stepName: string): void {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`  STEP: ${stepName}`);
    console.log(`${'─'.repeat(60)}`);
  }

  testStart(testName: string): void {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  TEST: ${testName}`);
    console.log(`${'═'.repeat(60)}`);
  }

  testPass(testName: string): void {
    console.log(`\n  ✅ PASS: ${testName}\n`);
  }

  testFail(testName: string, error: unknown): void {
    console.error(`\n  ❌ FAIL: ${testName}`);
    console.error(`     ${error}\n`);
  }
}
