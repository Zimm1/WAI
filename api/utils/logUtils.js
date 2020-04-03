const winston = require('winston');
const morgan = require('morgan');
const stripAnsi = require('strip-ansi');
const path = require('path');
const appRoot = require('app-root-path').path;
const fs = require('fs');

const LOG_DIR_PATH = path.resolve(appRoot, 'logs');
const LOG_FILE_PATH = path.resolve(LOG_DIR_PATH, 'api-logs.log');

const logInit = () => {
    if (!fs.existsSync(LOG_DIR_PATH)) {
        fs.mkdirSync(LOG_DIR_PATH);
    }
    try { fs.chmodSync(LOG_DIR_PATH, '777'); } catch (e) {}

    if (!fs.existsSync(LOG_FILE_PATH)) {
        fs.writeFileSync(LOG_FILE_PATH, '');
    }
    try { fs.chmodSync(LOG_FILE_PATH, '777'); } catch (e) {}
}

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: LOG_FILE_PATH,
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
    logger,
    logInit
};