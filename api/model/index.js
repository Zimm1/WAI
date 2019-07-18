'use strict';

const fs        = require('fs');
const path      = require('path');
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-auto-increment');
const Schema = mongoose.Schema;


const db        = {};

function omitPrivate(model) {
    const privateFields = ["__v"];

    if (model && model.schema) {
        Object.keys(model.schema).map((key) => {
            if (model.schema[key].private) {
                delete model.schema[key].private;
                privateFields.push(key);
            }
        })
    }

    return (doc, obj) => {
        privateFields.forEach((p) => {
           delete obj[p];
        });
        return obj;
    }
}

function checkAutoIncrement(model, modelSchema, modelName) {
    if (!model.schema._id) {
        modelSchema.plugin(AutoIncrement.plugin, modelName);
    }
}

function addIndexesToSchema(model, schema) {
    if (!model.indexes) {
        return;
    }

    model.indexes.forEach((index) => {
        schema.index(index);
    });
}

function initSchemaData(model, schema) {
    if (!model.init || !model.init.length) {
        return Promise.resolve();
    }

    return schema.insertMany(model.init, {ordered: false})
        .catch((e) => {
            if (e.code !== 11000) {
                throw e;
            }
        });
}

AutoIncrement.initialize(mongoose.connection);

fs
    .readdirSync(__dirname)
    .filter((fileName) => {
        return (fileName.endsWith('.model.js'));
    })
    .forEach(async (fileName) => {
        const model = require(path.join(__dirname, fileName));
        const modelSchema = new Schema(model.schema, {
            toJSON: {
                transform: omitPrivate(model)
            }
        });
        const modelName = fileName.split('.')[0];

        checkAutoIncrement(model, modelSchema, modelName);
        modelSchema.methods = model.methods || {};

        addIndexesToSchema(model, modelSchema);

        const schema = mongoose.model(modelName, modelSchema);

        try {
            await initSchemaData(model, schema);
        } catch (e) {
            console.error("Couldn't insert initial values for model '" + modelName + "':", e);
        }

        db[modelName] = schema;
    });

module.exports = db;