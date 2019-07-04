'use strict';

const express = require('express');
const mongoose = require('mongoose');
const config = require('config');

const clientRouter = require('./client/client.router');
const apiRouter = require('./api/api.router');


const PORT = config.get('EXPRESS.PORT');

mongooseInit().then(() => {
    expressInit();
}).catch((e) => {
    console.error('Critical error: ' + e.message);
});



function expressInit() {
    const app = express();
    app.use('/api', apiRouter);
    app.use(clientRouter);

    app.listen(PORT);
    console.log(`Express running on port ${PORT}`);
}

function mongooseInit() {
    return mongoose
        .connect(
            config.get('MONGO.DB'),
            {useNewUrlParser: true}
        )
        .then(() => {
            mongoose.connection.on('error', console.error.bind(console, 'MongoDB error:'));
        });
}