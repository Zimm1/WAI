'use strict';

const express = require('express');
const mongoose = require('mongoose');
const config = require('config');

const {logger} = require('./api/utils/logUtils');

const apiRouter = require('./api/api.router');
const clientRouter = require('./client/client.router');

const PORT = config.get('EXPRESS.PORT');


mongooseInit().then(() => {
    expressInit();
}).catch((e) => {
    logger.error(e.message, {label: 'START'});
});

function expressInit() {
    const app = express();

    app.use('/api', apiRouter);
    app.use(clientRouter);

    app.listen(PORT);
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