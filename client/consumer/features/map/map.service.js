(function () {
    angular.module('map')
        .service('MapService', MapService);

        function MapService($http, PoiService) {

            const baseUriOverpassApi = 'https://overpass-api.de/api/interpreter';
            const baseUriNominatim = "https://nominatim.openstreetmap.org";

            const LEVELS = 3;
            const ENOUGH_CLIPS = 200;
            const OLC_CHARS = ['2', '3', '4', '5', '6','7', '8', '9', 'C', 'F', 'G', 'H', 'J', 'M', 'P', 'Q', 'R', 'V', 'W', 'X'];
            const OLC_DIRECTIONS = [ [-1, 1], [-1, 0], [-1, -1], [0, 1], [0, -1], [1, 1], [1, 0], [1, -1] ];

            let currentApiKey = 0;

            const clips = new Map();

            const loadYoutubeApi = () => {
                return new Promise((resolve, reject) => {
                    try {
                        gapi.load('client:auth2', resolve);
                    } catch (err) {
                        reject(err);
                    }
                });
            };

            const initYoutubeApi = () => {
                return gapi.client.init({
                    apiKey: YOUTUBE_API_KEYS[currentApiKey],
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
                });
            };

            const searchYoutubeApi = (params) => {
                return new Promise((resolve, reject) => {
                    try {
                        gapi.client.youtube.search.list(params).execute(resolve);
                    } catch (err) {
                        reject(err);
                    }
                });
            };

            const changeApiKey = () => {
                currentApiKey = (currentApiKey + 1 + YOUTUBE_API_KEYS.length) % YOUTUBE_API_KEYS.length;
            };

            const getNearOlcChar = (char, increment) => {
                return OLC_CHARS[(OLC_CHARS.indexOf(char) + increment + OLC_CHARS.length) % OLC_CHARS.length];
            };

            this.getOlcsAround = (olc) => {
                const olcs = [ olc ];

                OLC_DIRECTIONS.forEach(([x, y]) => {
                    const newOlc = olc.split('');
                    newOlc[olc.length - 2] = getNearOlcChar(olc[olc.length - 2], x);
                    newOlc[olc.length - 1] = getNearOlcChar(olc[olc.length - 1], y);
                    olcs.push(newOlc.join(''));
                });

                return olcs;
            };

            const getNearOlcsFromLevel = (olc, level) => {
                if (level === 0) {
                    return this.getOlcsAround(olc);
                }

                olc = olc.substring(0, olc.length - 3);
                if (level === 1) {
                    return this.getOlcsAround(olc);
                }

                olc = olc.substring(0, olc.length - 2);
                return this.getOlcsAround(olc)
                    .map((o) => o + '00');
            };

            const insertResponseClipItems = (items) => {
                items.forEach((item) => {
                    const id = item.id.videoId;

                    if (clips.has(id)) {
                        return;
                    }

                    const description = item.snippet.description;
                    const info = description.split(':');

                    const clip = {
                        url: "https://www.youtube.com/watch?v=".concat(item.id.videoId),
                        geoloc: info.length >= 1 ? info[0] : null,
                        purpose: info.length >=2 ? info[1] : null,
                        language: info.length >=3 ? info[2] : null,
                        content: info.length >=4 ? info[3] : null,
                        audience: info.length >=5 ? info[4] : null,
                        detail: info.length >=6 ? info[5] : null
                    };

                    if (clip.geoloc != null && clip.geoloc.indexOf('-') !== -1) {
                        clip.geoloc = clip.geoloc.split('-').slice(-1).pop();
                    }

                    if (clip.detail != null) {
                        clip.detail = parseInt(clip.detail.substring(0, 1)) || clip.detail;
                    }

                    clips.set(id, clip);
                });
            };

            const getClipsFromOlc = async (olc, pageToken) => {
                console.log(`Youtube api request using key n.${currentApiKey}`);

                const response = await searchYoutubeApi({
                    part: 'snippet',
                    q: olc,
                    maxResults: 50,
                    pageToken: pageToken || ""
                });

                if (response.code === 403) {
                    changeApiKey();
                    await initYoutubeApi();
                    await getClipsFromOlc(olc, pageToken);
                    return;
                }

                insertResponseClipItems(response.items);

                if (clips.size >= ENOUGH_CLIPS) {
                    return;
                }

                pageToken = response.nextPageToken;
                if (pageToken) {
                    await getClipsFromOlc(olc, pageToken);
                }
            };

            const getClipsFromOlcAndLevel = async (olc, level) => {
                await loadYoutubeApi();
                await initYoutubeApi();

                for (const o of getNearOlcsFromLevel(olc, level)) {
                    console.log(o);
                    await getClipsFromOlc(o);

                    if (clips.size >= ENOUGH_CLIPS) {
                        return;
                    }
                }

                ++level;
                if (level < LEVELS) {
                    await getClipsFromOlcAndLevel(olc, level);
                }
            };

            this.getClips = async (olc) => {
                clips.clear();
                await getClipsFromOlcAndLevel(olc, 0);

                console.log(`Number of clips found: ${clips.size}`);

                PoiService.createListPoiFromClips([...clips.values()]);

                return clips;
            };

            const getPoiInfo = function (placeIdOsm, placeTag, defaultName) {
                return new Promise((resolve, reject) => {
                    $http({
                        url: `${baseUriOverpassApi}?data=[out:json];${placeTag}(${placeIdOsm});out;`,
                        method: 'GET'
                    }).then(function successCallback(response){
                        response.defaultName = defaultName;
                        resolve(response);
                    }, function errorCallback(response){
                        reject(response);
                    });
                })
            };

            const getPoiName = function (lat,lng) {
                return new Promise(function (resolve, reject) {
                    $http({
                        url: `${baseUriNominatim}/reverse?lat=${lat}&lon=${lng}&format=json`,
                        method: 'GET'
                    }).then(function successCallback(response){
                        resolve(response);
                    }, function errorCallback(response){
                        reject(response);
                    });
                });
            }

            this.getPoiDefaultName = (olc) => {
                let pos = OpenLocationCode.decode(olc);
                return getPoiName(pos.latitudeCenter, pos.longitudeCenter).then((data) => {
                    let idOsm = data['data']['osm_id'];
                    let tagOsm = data['data']['osm_type'];
                    let countryCode = data['data']['address']['country_code'];
                    let displayName = data['data']['display_name'];
                    let arr = displayName.split(',');
                    let defaultName = [countryCode, arr[0]];
                    return getPoiInfo(idOsm, tagOsm, defaultName).then((data) => {
                        console.log(data);
                        let item = data['data']['elements'][0];
                        let defaultName = data['defaultName'];
                        if (item) {
                            if(item['tags']['wikipedia']){
                                let wikipediaTags = item['tags']['wikipedia'];
                                return wikipediaTags.split(':');
                            } else {
                                return defaultName;
                            }
                        }
                    });
                });
            };

            this.getPageImages = function (lang, pageTitle, imageSize) {
                let encodedString = encodeURIComponent(pageTitle).replace(/%20/g, "+");
                return new Promise(function (resolve, reject){
                    $http({
                        url: `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodedString}&pithumbsize=${imageSize}&format=json&origin=*`,
                        method: 'GET'
                    }).then(function successCallback(response){
                        resolve(response);
                    }, function errorCallback(response){
                        reject(response);
                    });
                });
            };
            
            this.getQueryResult = function (searchtext) {
                return new Promise(function (resolve, reject){
                   $http({
                       url: `${baseUriNominatim}/search?q=${searchtext}&format=json`,
                       method: 'GET'
                   }).then(function successCallback(response){
                       resolve(response);
                   }, function errorCallback(response){
                       reject(response);
                   })
                });
            };

            this.getLangLinks = function (pageTitle, linksLimit, lang, baseLang, pageContinue){
                let encodedString = encodeURIComponent(pageTitle).replace(/%20/g, "+");
                return new Promise(function (resolve, reject) {
                    let langParam = undefined,
                        continueParam = '';
                    if(lang){
                        langParam = `&lllang=${lang}`;
                    }
                    if(pageContinue){
                        continueParam = `&llcontinue=${pageContinue}`;
                    }
                    $http({
                        url: `https://${baseLang}.wikipedia.org/w/api.php?action=query&format=json&prop=langlinks&titles=${encodedString}${langParam || continueParam}&lllimit=${linksLimit}&origin=*`,
                        method: `GET`
                    }).then(function successCallback(response) {
                        resolve(response);
                    }, function errorCallback(response) {
                        reject(response);
                    })
                });
            };

            this.getPageText = function (lang, pageTitle, numSentences){
                let encodedString = encodeURIComponent(pageTitle).replace(/%20/g, "+");
                return new Promise(function (resolve, reject){
                   $http({
                       url: `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exsentences=${numSentences}&explaintext&titles=${encodedString}&origin=*`,
                       method: 'GET'
                   }).then(function successCallback(response) {
                       resolve(response);
                   }, function errorCallback(response) {
                       reject(response);
                   })
                });
            };
        }
})();
