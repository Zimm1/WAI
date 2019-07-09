(function (){

    angular.module('consumerApp',['ngMaterial','leaflet-directive'])
        .controller('mainController',['$scope', 'leafletData','mapService', mainController])
        .config(function ($mdIconProvider){
            $mdIconProvider
                .icon('menu', '../common/assets/svg/menu.svg')
                .icon('pin', '../common/lib/leaflet/images/marker-icon.png');
        });

    function mainController($scope, leafletData,mapService){
        var userCoordinate = {};
        var userMarker;
        var initObj = {
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

        angular.extend($scope, initObj);
        $scope.mybounds = {'northEast': {'lat': 90, 'lng': 180},'southWest': {'lat': -90, 'lng': -180}};

        $scope.centerView = function (){
            $scope.center.lat = userCoordinate.lat;
            $scope.center.lng = userCoordinate.lng;
            $scope.center.zoom = 18;
        };

        $scope.updatePosition = function() {
            leafletData.getMap('map').then(function(map) {
                if(userMarker){
                    map.removeLayer(userMarker);
                }

                // Circle
                var circleLocation = new L.LatLng(userCoordinate.lat, userCoordinate.lng);
                var circleOptions = {
                    color: 'blue'
                };
                userMarker = new L.Circle(circleLocation, 5, circleOptions);
                map.addLayer(userMarker);
            });
        };

        $scope.getLocation = function() {
            leafletData.getMap('map').then(function(map) {
                    map.locate({setView: true, maxZoom: 16, watch: false, enableHighAccuracy: true});
                    map.on('locationfound', function (e) {
                        console.log(e.latlng, e.accuracy);
                        $scope.updateUserPosition(e.latlng.lat, e.latlng.lng);
                        //map.setView([userCoordinate.lat, userCoordinate.lng],18);
                        $scope.centerView();
                        $scope.updatePosition(userCoordinate.lat, userCoordinate.lng);
                    });
                }
            )};

        $scope.updateUserPosition = function (lat,lng){
            userCoordinate.lat = lat;
            userCoordinate.lng = lng;
        };

        $scope.$on('leafletDirectiveMap.map.click', function(event, wrap){
            userCoordinate = {
                'lat': wrap.leafletEvent.latlng.lat,
                'lng': wrap.leafletEvent.latlng.lng
            };
            $scope.updatePosition();
            $scope.centerView();
        });

        /*angular.extend($scope, {
            markers: {
                myFirstMarker: {
                    lat: 59.91,
                    lng: 10.75,
                    message: "I want to travel here!",
                    focus: true,
                    draggable: true,
                    icon: {
                        iconUrl:       'http://localhost:8000/common/lib/leaflet/images/marker-icon.png',
                        iconRetinaUrl: 'http://localhost:8000/common/lib/leaflet/images/marker-icon-2x.png',
                        shadowUrl:     'http://localhost:8000/common/lib/leaflet/images/marker-shadow.png'
                    }
                }
            },
        });*/

        $scope.getLocation();
        $scope.isDisabled = false;
        $scope.noCache = true;
        $scope.searchText = '';
        $scope.minLength = 3;

        this.getPlusCode = function (lat,lng){
            mapService.getPlusCode(lat,lng).then(function (data){
                console.log(data);
            }).catch(function (error){
                console.log(error);
            });
        };

        $scope.getQueryResult = function (searchText){
          return mapService.getQueryResult(searchText)
              .then(function (data){
                  return data['data'];
              })
              .catch(function (error){
                console.log(`getQueryResult: ${error}`);
                return [];
              });
        };

        $scope.itemSelectedChanged= function (item) {
            console.log('item selected: '+item);
            $scope.updateUserPosition(parseFloat(item['lat']), parseFloat(item['lon']));
            $scope.updatePosition();
            $scope.centerView();
            $scope.center.zoom = 16;
        };
    }
})();
