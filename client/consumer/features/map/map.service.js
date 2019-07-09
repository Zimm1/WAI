(function () {
    angular.module('map')
        .service('MapService', MapService);

        function MapService($http) {
            var baseUri = "https://plus.codes/api";
            var baseUriNominatim = "https://nominatim.openstreetmap.org";

            this.getPlusCode = function (lat, lng) {
                return new Promise(function (resolve, reject) {
                    $http({
                        url: `${baseUri}?address=${lat},${lng}`,
                        method: 'GET'
                    }).then(function successCallback(response) {
                        resolve(response);
                    }, function errorCallback(response) {
                        reject(response);
                    })
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
            }
        }
})();
