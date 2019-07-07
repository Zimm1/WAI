(function (){

    angular.module('consumerApp',['ngMaterial'])
        .controller('mainController',['$scope' ,'mapService', mainController])
        .config(function ($mdIconProvider){
            $mdIconProvider
                .icon('menu', '../common/assets/svg/menu.svg');
        });

    function mainController($scope, mapService){
        var myCoordinate = {
            'lat': 42.261,
            'lng': 11.063
        };
        /*
                       North (+90)
                           |
            (-180) West ———+——— East (+180)
                           |
                         South (-90)
        * */
        var southWest = L.latLng(-90, -180),
            northEast = L.latLng(90, 180);
        var mybounds = L.latLngBounds(southWest, northEast);

        initPosition();

        var mymap;
        var posMarker;

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
            myCoordinate['lat'] = item['lat'];
            myCoordinate['lng'] = item['lon'];
            updatePosition();

        };

        function initPosition(){
            mymap = L.map('map',{
                maxBoundsViscosity: 1.0
            }).setView([myCoordinate['lat'], myCoordinate['lng']],5);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
                maxZoom: 20,
                minZoom: 2
            }).addTo(mymap);
            mymap.setMaxBounds(mybounds);
            mymap.locate({watch:false, setView: true, maxZoom: 18, timeout: 30000});
            mymap.zoomControl.setPosition('bottomright');
            mymap.on('click', clickOnMap);
            mymap.on('locationfound', onLocationFound);
            mymap.on('locationerror', onLocationError);
        }

        function onLocationError(e){
            console.log(`onLocationError: ${e.message}`);
        }

        function onLocationFound(e){
            var param = e.latlng;
            myCoordinate['lat'] = param['lat'];
            myCoordinate['lng'] = param['lng'];
            updatePosition();
        }

        function updatePosition(){
            mymap.panTo([myCoordinate['lat'], myCoordinate['lng']]);
            mymap.setZoom(18);
            if(posMarker){
                mymap.removeLayer(posMarker);
            }
            posMarker = L.circle([myCoordinate['lat'], myCoordinate['lng']], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 5
            }).addTo(mymap);
        }

        function clickOnMap(e){
            var param = e.latlng;
            myCoordinate['lat'] = param['lat'];
            myCoordinate['lng'] = param['lng'];
            updatePosition();
        }
    }
})();
