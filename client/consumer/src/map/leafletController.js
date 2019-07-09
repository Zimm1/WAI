(function () {
    angular.module('consumerApp')
        .controller('leafletController', ['leafletData', 'mapService',leafletController]);

    function leafletController(leafletData, mapService){
        var userPosition = {};
        var initObject = {
            center: {
                zoom: 10
            },
            defaults: {
                maxZoom: 18,
                minZoom: 2,
                scrollWheelZoom: true,
                doubleClickZoom: false,
                zoomControlPosition: 'bottomright'
            },
            events: {
                map: {
                    enable: ['zoomstart', 'drag', 'click', 'mousemove'],
                    logic: 'emit'
                }
            }
        };
        /*
                       North (+90)
                           |
            (-180) West ———+——— East (+180)
                           |
                         South (-90)
        * */
        $scope.mybounds = {'northEast': {'lat': 90, 'lng': 180},'southWest': {'lat': -90, 'lng': -180}};

        $scope.initMap = function () {
            angular.extend($scope, initObject);
        };

        $scope.setMaxBounds = function (){

        }

    }
})();
