(function () {
    angular.module('map')
        .service('MapService', MapService);

        function MapService($http) {
            var baseUriNominatim = "https://nominatim.openstreetmap.org";
            var wikipediaBaseUri = "https://en.wikipedia.org";
            
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
                var encodedString = encodeURIComponent(pageTitle).replace(/%20/g, "+");
                return new Promise(function (resolve, reject) {
                    var langParam = undefined,
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
                var encodedString = encodeURIComponent(pageTitle).replace(/%20/g, "+");
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
