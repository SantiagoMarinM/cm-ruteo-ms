export interface ILogger {
    add(level: string, message: string, requestLogData?: unknown[]): void;
    info(message: string, requestLogData?: unknown[]): void;
    error(message: string, error?: unknown, requestLogData?: unknown[]): void;
}
