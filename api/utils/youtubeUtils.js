const fs = require('fs');
const {google} = require("googleapis");
const ffmpeg = require('fluent-ffmpeg');
const {logger} = require('../utils/logUtils');
const path = require('path');
const appRoot = require('app-root-path').path;
const config = require('config');
const RESOURCES_PATH = path.resolve(appRoot, config.get("API.RESOURCES_PATH"));

const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch?v=';
const BACKGROUND_IMG_FILE_NAME = 'bg.png';

const YOUTUBE_CONFIG_PATH = '../../config/youtube/';
const REFRESH_TOKENS = require(YOUTUBE_CONFIG_PATH + 'refresh_tokens');
const N_CREDENTIALS = config.get('YOUTUBE.N_CREDENTIALS');
const CREDENTIALS = [];
for (let i = 0; i < N_CREDENTIALS; ++i) {
    CREDENTIALS.push(require(YOUTUBE_CONFIG_PATH + 'credentials/credentials-' + ("0" + i).slice(-2)));
}

function YoutubeUploader() {
    this.auth = null;
    this.currentCredential = 0;

    const createOlcGeneralToDetail = (olc) => {
        const firstLevel = olc.substring(0, olc.length-2);
        const secondLevel = firstLevel.substring(0, firstLevel.length-3) + '00+';
        return secondLevel + '-' + firstLevel + '-' + olc;
    };

    const generateDescription = (clip) => {
        console.log(clip);
        clip.geoloc = createOlcGeneralToDetail(clip.geoloc);
        let desc = clip.geoloc + ':' + clip.purpose + ':' + clip.language + ':' + clip.content + ':' + clip.audience;

        if (clip.purpose === 'why') {
            desc = desc + ':' + clip.detail;
        }

        return desc;
    };

    this._executeFfmpeg = (args) => {
        const command = ffmpeg().output(' ');

        command._outputs[0].isFile = false;
        command._outputs[0].target = "";

        command._global.get = () => {
            if (typeof args !== "string") {
                return args;
            }

            return args.split(' ').filter(c => c !== "" && c !== "\\\n");
        };

        return command;
    };

    this._audio2video = (audioFileName) => {
        return new Promise((resolve, reject) => {

            const videoFileName = `${audioFileName.split('.')[0]}.mp4`;

            this._executeFfmpeg(
                `-loop 1 -framerate 2 -y ` +
                `-i ${RESOURCES_PATH + BACKGROUND_IMG_FILE_NAME} ` +
                `-i ${RESOURCES_PATH + audioFileName} ` +
                `-c:v libx264 -tune stillimage -crf 18 ` +
                `-c:a copy -shortest -pix_fmt yuv420p ` +
                `${RESOURCES_PATH + videoFileName}`
            )
                .on('start', () => {
                    logger.info('Conversion started');
                })
                .on('error', (err) => {
                    logger.error(err.message);
                    reject(err);
                })
                .on('end', () => {
                    logger.info('Conversion done');
                    resolve(videoFileName);
                })
                .run();
        });
    };

    this._authenticate = () => {
        this.auth = new google.auth.OAuth2(
            CREDENTIALS[this.currentCredential].web.client_id,
            CREDENTIALS[this.currentCredential].web.client_secret
        );
        this.auth.setCredentials({
            refresh_token: REFRESH_TOKENS[this.currentCredential]
        });
    };
    this._authenticate();

    this._upload = (videoData) =>
        new Promise((resolve, reject) => {
            logger.info("Upload started with credential " + ("0" + this.currentCredential).slice(-2));

            google.youtube({ version: 'v3', auth: this.auth }).videos.insert({
                resource: {
                    snippet: {
                        title: new Date().getTime(),
                        description: videoData.description
                    },
                    status: {
                        privacyStatus: "public"
                    }
                },
                part: "snippet,status",
                media: {
                    body: fs.createReadStream(RESOURCES_PATH + videoData.fileName)
                }
            }, (err, data) => {
                if (err) {
                    logger.error("Upload failed with credential " + ("0" + this.currentCredential).slice(-2));
                    logger.error(err.message);
                    reject(err);
                    return;
                }

                logger.info("Upload done with credential " + ("0" + this.currentCredential).slice(-2));
                resolve(data);
            });
        });

    this.upload = async (videoData, startingCredential=this.currentCredential) => {
        this._authenticate();

        try {
            const uploadResult = await this._upload(videoData);
            return Promise.resolve(uploadResult);
        } catch (err) {
            try {
                this.currentCredential = (this.currentCredential + 1) % N_CREDENTIALS;
                if (this.currentCredential === startingCredential) {
                    const message = "Upload failed with all credentials";
                    logger.error(message);
                    return Promise.reject(new Error(message));
                }
                return await this.upload(videoData, startingCredential);
            } catch (err) {
                return Promise.reject(err);
            }
        }
    };

    this.uploadAudio = async (clip) => {
        const videoData = {
            fileName: await this._audio2video(clip.audio),
            description: generateDescription(clip)
        };

        return this.upload(videoData)
            .then(uploadResult => YOUTUBE_VIDEO_URL + uploadResult.data.id)
            .finally(() => {
                fs.unlink(RESOURCES_PATH + clip.audio, () => {});
                fs.unlink(RESOURCES_PATH + videoData.fileName, () => {});
            });
    };
}

const YoutubeUploaderSingleton = (function () {
    let instance = null;

    const createInstance = () => {
        return new YoutubeUploader();
    };

    return {
        getInstance: () => {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports = YoutubeUploaderSingleton;
