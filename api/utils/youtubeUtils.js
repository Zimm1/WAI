const fs = require('fs');
const Google = require("googleapis");
const ffmpeg = require('fluent-ffmpeg');
const {logger} = require('../utils/logUtils');
const config = require('config');
const RESOURCES_PATH = config.get("API.RESOURCES_PATH");

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

    this._executeFfmpeg = args => {
        let command = ffmpeg().output(' ');
        command._outputs[0].isFile = false;
        command._outputs[0].target = "";
        command._global.get = () => {
            if(typeof args === "string") {
                return args.split(' ').filter(c => c !== "" && c !== "\\\n")
            } else return args;
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
        this.auth = new Google.auth.OAuth2(
            CREDENTIALS[this.currentCredential].web.client_id,
            CREDENTIALS[this.currentCredential].web.client_secret
        );
        this.auth.setCredentials({
            refresh_token: REFRESH_TOKENS[this.currentCredential]
        });
    };
    this._authenticate();

    this._upload = (videoFileName) =>
        new Promise((resolve, reject) => {
            logger.info("Upload started with credential " + ("0" + this.currentCredential).slice(-2));

            Google.youtube({ version: 'v3', auth: this.auth }).videos.insert({
                resource: {
                    snippet: {
                        title: new Date().getTime()
                    },
                    status: {
                        privacyStatus: "unlisted"
                    }
                },
                part: "snippet,status",
                media: {
                    body: fs.createReadStream(RESOURCES_PATH + videoFileName)
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

    this.upload = async (videoFileName, startingCredential=this.currentCredential) => {
        this._authenticate();

        try {
            return await this._upload(videoFileName);
        } catch (err) {
            try {
                if ((++this.currentCredential) % N_CREDENTIALS === startingCredential) {
                    const message = "Upload failed with all credentials";
                    logger.error(message);
                    return Promise.reject(new Error(message));
                }
                return await this.upload(videoFileName, startingCredential);
            } catch (err) {
                return Promise.reject(err);
            }
        }
    };

    this.uploadAudio = async (audioFileName) => {
        const videoFileName = await this._audio2video(audioFileName);
        return this.upload(videoFileName)
            .then(uploadResult => YOUTUBE_VIDEO_URL + uploadResult.id)
            .finally(() => {
                fs.unlink(RESOURCES_PATH + audioFileName, () => {});
                fs.unlink(RESOURCES_PATH + videoFileName, () => {});
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
