'use strict';

const fs        = require('fs');
const path      = require('path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const db        = {};

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