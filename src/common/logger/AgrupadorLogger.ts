import { injectable } from 'inversify';
import { ILogger } from './loggerInterface';

@injectable()
export class AgrupadorLogger implements ILogger {
    add(level: string, message: string, requestLogData?: unknown[]): void {
        if (requestLogData) {
            requestLogData.push({ level, message, timestamp: new Date().toISOString() });
        }
        // No se emite nada globalmente.
    }

    info(message: string, requestLogData?: unknown[]): void {
        if (requestLogData) {
            requestLogData.push({ level: 'info', message, timestamp: new Date().toISOString() });
        }
    }

    error(message: string, error?: unknown, requestLogData?: unknown[]): void {
        if (requestLogData) {
            requestLogData.push({ level: 'error', message, error, timestamp: new Date().toISOString() });
        }
    }
}
