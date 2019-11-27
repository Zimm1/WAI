const winston = require('winston');
const morgan = require('morgan');
const stripAnsi = require('strip-ansi');


const logger = winston.createLogger({
        transports: [
            new winston.transports.File({
                level: 'info',
                filename: './logs/api-logs.log',
                handleExceptions: true,
                maxsize: 5242880, // 5MB
                maxFiles: 5,
                format: winston.format.combine(
                    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                    winston.format((info) => {
                        info.message = stripAnsi(info.message);
                        return info;
                    })(),
                    winston.format.json()
                )
            }),
            new winston.transports.Console({
                level: 'debug',
                handleExceptions: true,
                format: winston.format.combine(
                    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                    winston.format.colorize(),
                    winston.format.printf(({level, message, label, timestamp}) => {
                        return `(${timestamp}) [${label || "NONE"}] <${level}> "${message}"`;
                    })
                )
            })
        ],
        exitOnError: false
    });

const httpLogger = morgan("dev", {
    stream: {
        write: (message) =>
            logger.info(message.trim(), {label: 'HTTP'})
    }
});

module.exports = {
    httpLogger,
    logger
};