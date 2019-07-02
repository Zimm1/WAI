'use strict';

const fs        = require('fs');
const path      = require('path');
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;


const db        = {};

function omitPrivate(doc, obj) {
    delete obj.__v;
    return obj;
}

fs
    .readdirSync(__dirname)
    .filter(fileName => {
        return (fileName.endsWith('.model.js'));
    })
    .forEach(fileName => {
        const model = require(path.join(__dirname, fileName));
        const modelSchema = new Schema(model.schema, {
            toJSON: {
                transform: omitPrivate
            }
        });

        modelSchema.plugin(AutoIncrement, {inc_field: '_id'});

        fileName = fileName.split('.')[0];
        db[fileName] = mongoose.model(fileName, modelSchema);
    });

module.exports = db;