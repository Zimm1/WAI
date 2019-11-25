(function () {
    angular.module('map')
        .service('MapService', MapService);

        function MapService($http) {

            let fakeData = [{
                "categories": [{
                        "_id": 0,
                        "name": "A",
                    "icon": {
                        "icon": "monument",
                        "markerColor": "orange"
                    }
                    }],
                "_id": 26,
                "name": "Porta San Donato, Bologna",
                "location": {
                    "lat": 44.498459,
                    "lng": 11.356230
                }
            },{
                "categories": [{
                    "_id": 0,
                    "name": "B",
                    "icon": {
                        "icon": "monument",
                        "markerColor": "orange"
                    }
                }],
                "_id": 27,
                "name": "Piazza San Marco",
                "location": {
                    "lat": 45.433889,
                    "lng": 12.338056
                }
            },{
                "categories": [{
                    "_id": 0,
                    "name": "B",
                    "icon": {
                        "icon": "futbol",
                        "markerColor": "green"
                    }
                }],
                "_id": 28,
                "name": "Mapei Stadium – Città del Tricolore",
                "location": {
                    "lat": 44.714722,
                    "lng": 10.649722
                }
            },{
                "categories": [{
                    "_id": 0,
                    "name": "B",
                    "icon": {
                        "icon": "brush",
                        "markerColor": "purple"
                    }
                }],
                "_id": 29,
                "name": "Colosseum",
                "location": {
                    "lat": 41.8902,
                    "lng": 12.4924
                }
            }];

            const baseUriNominatim = "https://nominatim.openstreetmap.org";
            const wikipediaBaseUri = "https://en.wikipedia.org";
            const poiUri = "http://localhost:8000/api/poi";

            this.getPoiUserPosition = function (lat, lng){
                return new Promise(function (resolve, reject){
                    $http({
                        url: `${poiUri}?lat=${lat}&lng=${lng}`,
                        method: 'GET'
                    }).then(function successCallback(response){
                        resolve(response);
                    }, function errorCallback(response){
                        reject(response);
                    });
                })
            };

            this.getPageImages = function (pageTitle, imageSize) {
                let encodedString = encodeURIComponent(pageTitle).replace(/%20/g, "+");
                return new Promise(function (resolve, reject){
                    $http({
                        url: `${wikipediaBaseUri}/w/api.php?action=query&format=json&prop=pageimages&titles=${encodedString}&pithumbsize=${imageSize}&format=json&origin=*`,
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

            this.getLangLinks = function (pageTitle, linksLimit, lang, pageContinue){
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
                        url: `${wikipediaBaseUri}/w/api.php?action=query&format=json&prop=langlinks&titles=${encodedString}${langParam || continueParam}&lllimit=${linksLimit}&origin=*`,
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
