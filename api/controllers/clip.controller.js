const {body, query} = require('express-validator');
const upload = require('multer')({ dest: 'uploads/' });
const mongoose = require('mongoose');

const model = require("../model");
const expressUtils = require("../utils/expressUtils");
const authUtils = require("../utils/authUtils");
const mongoUtils = require("../utils/mongoUtils");
const PAGINATION_LIMIT = require('config').get("API.PAGINATION.LIMIT");


const getAll = [
    new authUtils.auth()
        .role(authUtils.getRoles().EDITOR)
        .role(authUtils.getRoles().ADMIN)
        .check(),
    (req, res, next) => {
        const pagination = {
            page: parseInt(req.query.page) || 0,
            limit: parseInt(req.query.limit) || PAGINATION_LIMIT
        };

        const query = model.clip.find();

        if (req.user.role === authUtils.getRoles().EDITOR._id) {
            query.where('editor').equals(req.user._id);
        }

        query.skip(pagination.page * pagination.limit)
            .limit(pagination.limit)
            .populate({path: 'editor', select: 'username'})
            .populate({path: 'poi', select: 'name'})
            .then((clips) => {
                res.status(200).json({
                    success: true,
                    paginator: {
                        page: pagination.page,
                        limit: pagination.limit
                    },
                    count: clips.length,
                    data: clips
                });
        }).catch((e) => {
            console.error(e);
            expressUtils.sendError(res, 500, e.message);
        });
    }
];

const get = [
    new authUtils.auth()
        .role(authUtils.getRoles().EDITOR)
        .role(authUtils.getRoles().ADMIN)
        .check(),
    (req, res, next) => {
        if (req.params.id == null) {
            expressUtils.sendError(res, 400);
            return;
        }

        model.clip.findById(req.params.id)
            .populate({path:'editor', select: 'username'})
            .populate({path:'poi', select: 'name'})
            .then((clip) => {
                if (!clip) {
                    expressUtils.sendError(res, 404);
                    return;
                }

                if (req.user.role !== authUtils.getRoles().ADMIN._id && clip.editor.id !== req.user._id) {
                    expressUtils.sendError(res, 401, "User id not authorized");
                    return;
                }

                res.status(200).json({
                    success: true,
                    data: clip
                });
            }).catch((e) => {
                console.error(e);
                expressUtils.sendError(res, 500, e.message);
            });
    }
];

const post = [
    new authUtils.auth()
        .role(authUtils.getRoles().EDITOR)
        .role(authUtils.getRoles().ADMIN)
        .check(),
    upload.single('audio'),
    body('poi', 'Poi id must be valid').optional().isInt(),
    body('purpose', 'Purpose required').not().isEmpty().isString(),
    body('language', 'Language required').not().isEmpty().isString(),
    body('content', 'Content required').not().isEmpty().isString(),
    body('audience', 'Audience required').not().isEmpty().isString(),
    body('detail', 'Detail required').not().isEmpty().isString(),
    expressUtils.checkValidation,
    async (req, res, next) => {
        // req.audio

        // Upload file on yt
        const audioLink = 'https://www.youtube.com/watch?v=LDU_Txk06tM';

        let clip = new model.clip({
            editor: req.user._id,
            poi: req.body.poi,
            audio: audioLink,
            purpose: req.body.purpose,
            language: req.body.language,
            content: req.body.content,
            audience: req.body.audience,
            detail: req.body.detail
        });
        
        try {
            clip = await clip.save();
            res.status(201).send({
                success: true,
                data: clip
            });
        } catch (e) {
            if (e.code === 11000 || e.code === 11001) {
                const duplicateField = mongoUtils.getFieldFromDuplicateError(e);
                expressUtils.sendError(res, 422, duplicateField + " already taken");
            } else {
                expressUtils.sendError(res, 500, e.message);
            }
        }
    }
];

const put = [
    new authUtils.auth()
        .role(authUtils.getRoles().EDITOR)
        .role(authUtils.getRoles().ADMIN)
        .check(),
    upload.single('audio'),
    body('poi', 'Poi id must be valid').optional().isInt(),
    body('purpose', 'Purpose must be string').optional().isString(),
    body('language', 'Language must be string').optional().isString(),
    body('content', 'Content must be string').optional().isString(),
    body('audience', 'Audience must be string').optional().isString(),
    body('detail', 'Detail must be string').optional().isString(),
    expressUtils.checkValidation,
    (req, res, next) => {
        if (req.params.id == null) {
            expressUtils.sendError(res, 400);
            return;
        }

        model.clip.findById(req.params.id)
            .populate({path:'editor', select: 'username'})
            .populate({path:'poi', select: 'name'})
            .then(async (clip) => {
                if (!clip) {
                    expressUtils.sendError(res, 404);
                    return;
                }

                if (req.user.role !== authUtils.getRoles().ADMIN._id && clip.editor.id !== req.user._id) {
                    expressUtils.sendError(res, 401, "User id not authorized");
                    return;
                }

                for (key of Object.keys(clip.toObject())) {
                    if (req.body[key] == null) {
                        continue;
                    }
                    clip[key] = req.body[key];
                }

                await clip.save();

                model.clip.findById(req.params.id)
                    .populate({path:'editor', select: 'username'})
                    .populate({path:'poi', select: 'name'})
                    .then((clip) => {
                        res.status(200).json({
                            success: true,
                            data: clip
                        });
                    });
            }).catch((e) => {
                console.error(e);
                expressUtils.sendError(res, 500, e.message);
            });
    }
];

module.exports = {
    getAll,
    get,
    post,
    put
};