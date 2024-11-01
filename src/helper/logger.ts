import winston from 'winston';

export let logger: winston.Logger;

export const initLogger = (logLevel: string): void => {
    logger = winston.createLogger({
        level: logLevel,
        transports: [
            new winston.transports.Console({
            })
        ],
        format: winston.format.combine(
            winston.format.errors({ stack: true }), 
            winston.format.colorize({ all: true }),
            winston.format.splat(),
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            winston.format.align(),
            winston.format.printf(({ timestamp, level, message }) => {
                return `[${timestamp}] ${level}: ${message}`;
            }),
        ),
    });
    logger.debug(`Logger initialized with log level ${logLevel}`);
};
