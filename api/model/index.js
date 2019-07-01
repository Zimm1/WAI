'use strict';

const fs        = require('fs');
const path      = require('path');
const mongoose = require('mongoose');
const basename  = path.basename(__filename);
const db        = {};

const Schema = mongoose.Schema;

fs
    .readdirSync(__dirname)
    .filter(fileName => {
        return (fileName.endsWith('.model.js'));
    })
    .forEach(fileName => {
        const model = require(path.join(__dirname, fileName));
        const modelSchema = new Schema(model.schema);

        fileName = fileName.split('.')[0];
        db[fileName] = mongoose.model(fileName, modelSchema);
    });

module.exports = db;