const path = require('path');
const appRoot = require('app-root-path').path;

process.env.NODE_CONFIG_DIR = path.resolve(appRoot, 'config');

const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const http = require('http');

const { logInit, logger } = require('./api/utils/logUtils');
logInit();

const apiRouter = require('./api/api.router');
const clientRouter = require('./client/client.router');

const PORT = config.get('EXPRESS.PORT');


async function expressInit() {
    const app = express();

    app.use('/api', apiRouter);
    app.use(clientRouter);

    const httpServer = http.createServer(app);

    httpServer.listen(PORT);

    logger.info(`Express running on port ${PORT}`, {label: 'START'});
}

async function mongooseInit() {
    await mongoose
        .connect(config.get('MONGO.DB'), {
            useNewUrlParser: true,
            useCreateIndex: true
        });
    
    logger.info(`Mongoose connection opened to ${config.get('MONGO.DB')}`, { label: 'START' });

    mongoose.connection.on('error', (err) => {
        logger.error(err, { label: 'MONGO' });
    });
}

(async () => {
    try {
        await mongooseInit();
        await expressInit();
    } catch (e) {
        logger.error(e.message, {label: 'START'});
    }
})();
