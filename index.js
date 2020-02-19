'use strict';

const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const fs = require('fs');

const https = require('https');
const http = require('http');

const {logger} = require('./api/utils/logUtils');

const apiRouter = require('./api/api.router');
const clientRouter = require('./client/client.router');

const PORT = config.get('EXPRESS.PORT');

const privateKey = fs.readFileSync('./credentials/privkey.pem', 'utf8');
const certificate = fs.readFileSync('./credentials/cert.pem', 'utf8');
const ca = fs.readFileSync('./credentials/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

mongooseInit().then(() => {
    expressInit();
}).catch((e) => {
    logger.error(e.message, {label: 'START'});
});

function expressInit() {
    const app = express();

    app.use('/api', apiRouter);
    app.use(clientRouter);

    const httpServer = http.createServer(app);
    const httpsServer = https.createServer(credentials, app);

    httpServer.listen(PORT);
    httpsServer.listen(443);

    logger.info(`Express running on port ${PORT}`, {label: 'START'});
}

function mongooseInit() {
    return mongoose
        .connect(
            config.get('MONGO.DB'),
            {
                useNewUrlParser: true,
                useCreateIndex: true
            }
        )
        .then(() => {
            logger.info(`Mongoose connection opened to ${config.get('MONGO.DB')}`, {label: 'START'});

            mongoose.connection.on('error', (err) => {
                logger.error(err, {label: 'MONGO'});
            });
        });
}