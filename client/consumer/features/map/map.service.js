(function () {
    angular.module('map')
        .service('MapService', MapService);

        function MapService($http, PoiService) {

            const baseUriOverpassApi = 'https://overpass-api.de/api/interpreter';
            const baseUriNominatim = "https://nominatim.openstreetmap.org";

            let allVideos = [];
            let clips = [];

            function pushClips(){
                for (const item of allVideos) {
                    const description = item.snippet.description;
                    const info = description.split(':');
                    const dict = {
                        url: "https://www.youtube.com/watch?v=".concat(item.id.videoId),
                        geoloc: info.length >= 1 ? info[0] : null,
                        purpose: info.length >=2 ? info[1] : null,
                        language: info.length >=3 ? info[2] : null,
                        content: info.length >=4 ? info[3] : null,
                        audience: info.length >=5 ? info[4] : null,
                        detail: info.length >=6 ? info[5] : null
                    };
                    clips.push(dict);
                }
            }

            function arrayUnique(array) {
                var a = array.concat();
                for(var i=0; i<a.length; ++i) {
                    for(var j=i+1; j<a.length; ++j) {
                        if(a[i].snippet.description === a[j].snippet.description)
                            a.splice(j--, 1);
                    }
                }
                return a;
            }
            let c=0
            function GatherVideos(pageToken, finished, olc) {
                var request = gapi.client.youtube.search.list({
                    part: 'snippet',
                    q: olc,
                    maxResults: 50,
                    pageToken: pageToken
                });

                request.execute(function(response) {
                    allVideos = arrayUnique(allVideos.concat(response.items));
                    console.log(olc)
                    if (!response.nextPageToken||allVideos.length>=100){
                        if (allVideos.length<100 && c==0){
                            olc = olc.substring(0, olc.length - 2)
                            GatherVideos("", finished, olc);
                            c=1
                            console.log("c==1")
                        } else if (allVideos.length<100 && c==1){
                            tolc=olc.substring(0, olc.length - 1)
                            olc=tolc.replace(tolc.substring(tolc.length - 2,tolc.length),"00+")
                            GatherVideos("", finished, olc);
                            c=2
                            console.log("c==2")
                        } else if (allVideos.length>=100){
                            pushClips();
                            PoiService.createListPoiFromClips(clips);
                        } else if (!response.nextPageToken && allVideos.length<100){
                            pushClips();
                            PoiService.createListPoiFromClips(clips);
                        }
                        finished();
                    }
                    else
                        GatherVideos(response.nextPageToken, finished, olc);
                });

            }


            this.loadClipFromYoutube = (olc) => {
                return new Promise(function (resolve, reject){
                    gapi.client.setApiKey('AIzaSyAheW9XONTci7lXmP_96UE-zYL0J2-wcCE');
                    gapi.client.load('youtube', 'v3', function() {
                        GatherVideos("", function() {
                            console.log(clips);
                            }, olc);
                    });
                })
            };

            const getPoiInfo = function (placeIdOsm, placeTag) {
                return new Promise((resolve, reject) => {
                    $http({
                        url: `${baseUriOverpassApi}?data=[out:json];${placeTag}(${placeIdOsm});out;`,
                        method: 'GET'
                    }).then(function successCallback(response){
                        resolve(response);
                    }, function errorCallback(response){
                        reject(response);
                    });
                })
            }


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
                    return getPoiInfo(idOsm, tagOsm).then((data) => {
                        console.log(data);
                        let item = data['data']['elements'][0];
                        if (item) {
                            let wikipediaTags = item['tags']['wikipedia'];
                            return wikipediaTags.split(':');
                        }
                    });
                });
            }

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
