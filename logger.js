'use strict';

const winston = require('winston');

const level = process.env.LOG_LEVEL || 'info';

const logger = winston.createLogger({
  level: level,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // - Write all logs with level and below to `combined.log` 
    new winston.transports.File({ filename: 'combined.log', format: winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    })}),
    // - Write all logs error and below to `error.log`.
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
});

module.exports = logger