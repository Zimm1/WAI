'use strict';

const express = require('express');
const mongoose = require('mongoose');

const clientRouter = require('./client/client.router');
const apiRouter = require('./api/api.router');


// Constants
const PORT = 8000;

const app = express();

expressInit();
mongooseInit();

function expressInit() {
    app.use('/api', apiRouter);
    app.use(clientRouter);

    app.listen(PORT);
    console.log(`Express running on port ${PORT}`);
}

function mongooseInit() {
    mongoose
        .connect(
            'mongodb://mongo:27017/wai',
            {useNewUrlParser: true}
        )
        .then(() => {
            mongoose.connection.on('error', console.error.bind(console, 'MongoDB error:'));
        })
        .catch((e) => {
            console.error(e);
        });
}