const {body, query} = require('express-validator');
const multer = require('multer');

const model = require("../model");
const expressUtils = require("../utils/expressUtils");
const authUtils = require("../utils/authUtils");
const mongoUtils = require("../utils/mongoUtils");
const YoutubeUploader = require("../utils/youtubeUtils").getInstance();
const PAGINATION_LIMIT = require('config').get("API.PAGINATION.LIMIT");
const CLIP_CONFIG = require('config').get("API.CLIP");
const RESOURCES_PATH = require('config').get("API.RESOURCES_PATH");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, RESOURCES_PATH);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '.mp3');
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const accepted = file.originalname.split('.').slice(-1)[0] === 'mp3';
        cb(accepted ? null : new Error('Audio must be a mp3 file'), accepted);
    }
});


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
    body('geoloc', 'Geoloc id must be valid').optional().isString(),
    body('purpose', 'Purpose must be valid').optional().isString().custom(value =>
        CLIP_CONFIG.PURPOSE.includes(value)),
    body('language', 'Language must be valid').optional().isString().custom(value =>
        CLIP_CONFIG.LANGUAGE.includes(value)),
    body('content', 'Content must be valid').optional().isString().custom(value =>
        CLIP_CONFIG.CONTENT.includes(value)),
    body('audience', 'Audience must be valid').optional().isString().custom(value =>
        CLIP_CONFIG.AUDIENCE.includes(value)),
    body('detail', 'Detail must be valid').optional()
        .isInt({min: 0, max: CLIP_CONFIG.DETAIL.MAX}),
    expressUtils.checkValidation,
    async (req, res, next) => {
        try {
            const clip = new model.clip({
                geoloc: req.body.geoloc,
                audio: req.file.filename,
                purpose: req.body.purpose,
                language: req.body.language,
                content: req.body.content,
                audience: req.body.audience,
                detail: req.body.detail
            });

            const audioLink = await YoutubeUploader.uploadAudio(clip);

            res.status(200).send({
                success: true,
                data: {
                    audio: audioLink
                }
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

/*
const put = [
    new authUtils.auth()
        .role(authUtils.getRoles().EDITOR)
        .role(authUtils.getRoles().ADMIN)
        .check(),
    upload.single('audio'),
    body('purpose', 'Purpose must be valid').optional().isString().custom(value =>
        CLIP_CONFIG.PURPOSE.includes(value)),
    body('language', 'Language must be valid').optional().isString().custom(value =>
        CLIP_CONFIG.LANGUAGE.includes(value)),
    body('content', 'Content must be valid').optional().isString().custom(value =>
        CLIP_CONFIG.CONTENT.includes(value)),
    body('audience', 'Audience must be valid').optional().isString().custom(value =>
        CLIP_CONFIG.AUDIENCE.includes(value)),
    body('detail', 'Detail must be valid').optional()
        .isInt({min: 1, max: CLIP_CONFIG.DETAIL.MAX}),
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
*/

module.exports = {
    //getAll,
    //get,
    post,
    //put
};