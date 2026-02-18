import * as winston from 'winston';
import { TransportStreamOptions } from 'winston-transport';
import Transport from 'winston-transport';
import { Activity } from '../models/Activity.js';
import { getIpInfo } from '../services/ipGuide.js';

// Define Log Levels
const levels = {
    error: 0,
    warn: 1,
    audit: 2,
    info: 3,
    debug: 4,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    audit: 'magenta',
    info: 'green',
    debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `[${info.timestamp}] [${info.level}] [${info.module || 'SYSTEM'}]: ${info.message}`
    )
);


// Custom Transport for MongoDB (Activity Model)
class DatabaseTransport extends Transport {
    name = 'DatabaseTransport';
    override level?: string;
    override silent?: boolean;
    override handleExceptions?: boolean;
    override handleRejections?: boolean;

    constructor(opts?: TransportStreamOptions) {
        super(opts);
        this.level = opts?.level;
        this.silent = opts?.silent;
        this.handleExceptions = opts?.handleExceptions;
        this.handleRejections = opts?.handleRejections;
    }

    override log(info: any, callback: () => void) {
        setImmediate(async () => {
            try {
                const { level, message, module, details, context, userId, requestId, duration, eventType, ...rest } = info;

                // Strip colors helper
                const stripColors = (str: string) =>
                    str.replace(/\x1b\[[0-9;]*m/gi, '').replace(/\[[0-9;]*m/g, '').trim();

                const cleanLevel = typeof level === 'string'
                    ? stripColors(level).toLowerCase()
                    : level;

                // Skip debug logs for DB
                if (cleanLevel === 'debug') {
                    return;
                }

                const cleanMessage = typeof message === 'string'
                    ? stripColors(message)
                    : message;

                const ip = context?.ip || 'unknown';
                let ipInfo = undefined;

                if (cleanLevel !== 'debug' && ip !== 'unknown') {
                    ipInfo = await getIpInfo(ip);
                }

                // Combinar details con el resto de la metadata no destructurada
                const finalDetails = {
                    ...(typeof details === 'object' ? details : {}),
                    ...rest
                };

                await Activity.create({
                    level: cleanLevel as 'error' | 'warn' | 'info' | 'audit',
                    module: module || 'SYSTEM',
                    message: cleanMessage,
                    details: Object.keys(finalDetails).length > 0 ? finalDetails : undefined,
                    userId,
                    requestId,
                    duration,
                    eventType: eventType || (cleanLevel === 'audit' ? 'AUDIT' : 'SYSTEM'),
                    ip,
                    userAgent: context?.userAgent || 'unknown',
                    path: context?.path,
                    method: context?.method,
                    ipInfo,
                });
            } catch (err) {
                console.error('[DatabaseTransport] Error saving log', err);
            }
        });
        if (callback) callback();
    }
}

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    levels,
    format,
    transports: [
        new winston.transports.Console(),
        new DatabaseTransport()
    ],
});

export default logger;

// Helper interfaces for modular logging
export interface LogContext {
    ip?: string;
    userAgent?: string;
    path?: string;
    method?: string;
}

export const logAuth = (message: string, details: unknown, context?: LogContext, userId?: string) => {
    logger.log('info', message, { module: 'AUTH', details, context, userId, eventType: 'LOGIN' });
};

export const logAudit = (message: string, module: string, details: unknown, context?: LogContext, userId?: string) => {
    logger.log('audit', message, { module, details, context, userId, eventType: 'AUDIT' });
};

export const logDatabase = (message: string, details: unknown, context?: LogContext) => {
    logger.log('info', message, { module: 'DATABASE', details, context });
};

export const logError = (message: string, error: { message: string; stack?: string }, module: string = 'SYSTEM', context?: LogContext) => {
    logger.log('error', message, {
        module,
        details: {
            errorMessage: error.message,
            stack: error.stack
        },
        context
    });
};

export const logWarn = (message: string, module: string = 'SYSTEM', details: unknown, context?: LogContext) => {
    logger.log('warn', message, { module, details, context });
};
