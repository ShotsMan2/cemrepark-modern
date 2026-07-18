import winston from 'winston';

const { combine, timestamp, json, errors, splat } = winston.format;

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    splat(),
    json()
  ),
  defaultMeta: { service: 'cemrepark-api' },
  transports: [
    new winston.transports.Console({
      format: combine(
        errors({ stack: true }),
        timestamp(),
        json()
      )
    })
  ],
});

export default logger;