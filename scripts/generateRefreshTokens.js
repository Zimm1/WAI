const {google} = require('googleapis');
const open = require('open');
const fs = require('fs');
const app = require('express')();

const PORT = 5000;

const YOUTUBE_CONFIG_PATH = './config/youtube/';
const N_CREDENTIALS = require('config').get('YOUTUBE.N_CREDENTIALS');
const CREDENTIALS = [];
for (let i = 0; i < N_CREDENTIALS; ++i) {
    CREDENTIALS.push(require('.' + YOUTUBE_CONFIG_PATH + 'credentials/credentials-' + ("0" + i).slice(-2)));
}
const REFRESH_TOKENS_PATH = YOUTUBE_CONFIG_PATH + 'refresh_tokens.json';

let index = 0;
let oauth = null;
const refreshTokens = [];

const openAuth = () => {
    oauth = new google.auth.OAuth2(
        CREDENTIALS[index].web.client_id,
        CREDENTIALS[index].web.client_secret,
        CREDENTIALS[index].web.redirect_uris[0]
    );

    open(oauth.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/youtube.upload"]
    }));
};

const saveRefreshTokens = () => {
    const json = JSON.stringify(refreshTokens);

    fs.writeFile(REFRESH_TOKENS_PATH, json, (err) => {
        if (err) {
            console.error(`Error in saving to file: ${err}`);
            process.exit(1);
        }

        console.log('Refresh tokens saved to file.');
        process.exit(0);
    });
};

app.get("/oauth2callback", async (req, res) => {
    try {
        const {tokens} = await oauth.getToken(req.query.code);
        console.log(`Index ${index}: ${tokens.refresh_token}`);
        refreshTokens.push(tokens.refresh_token);
    } catch (err) {
        console.error(`Error at index ${index}: ${err}`);
    } finally {
        res.send("");

        if (++index < N_CREDENTIALS) {
            openAuth();
        } else {
            saveRefreshTokens();
        }
    }
});

app.listen(PORT);
openAuth();