(function (){
    angular.module('map')
        .controller('MapController', MapController);

    function MapController($scope, leafletData, MapService) {
        const map = leafletData.getMap('map');

        let userMarker;

        this.center = {};
        this.defaults = {
            maxZoom: 18,
            minZoom: 2,
            scrollWheelZoom: true,
            doubleClickZoom: false,
            zoomControlPosition: 'bottomright'
        };
        this.events = {
            map: {
                enable: ['zoomstart', 'drag', 'click', 'mousemove'],
                logic: 'emit'
            }
        };

        /*
                       North (+90)
                           |
            (-180) West ———+——— East (+180)
                           |
                         South (-90)
        * */
        this.mybounds = {'northEast': {'lat': 90, 'lng': 180},'southWest': {'lat': -90, 'lng': -180}};

        /*
        this.markers = {
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
        };
        */

        $scope.$on('leafletDirectiveMap.map.click', (event, wrap) => {
            updateUserPosition(wrap.leafletEvent.latlng.lat, wrap.leafletEvent.latlng.lng);
        });

        $scope.$on('wai.map.autocomplete.selected', (event, item) => {
            updateUserPosition(parseFloat(item.lat), parseFloat(item.lon));
        });

        const getLocation = () => {
            map.then((map) => {
                map
                    .locate({setView: true, enableHighAccuracy: true})
                    .on('locationfound', (e) => {
                        map.setZoom(16);
                        updateMarker(e.latlng.lat, e.latlng.lng);
                    });
                map.invalidateSize();
            });
        };

        const updateUserPosition = (lat, lng) => {
            centerView(lat, lng);
            updateMarker(lat, lng);
        };

        const centerView = (lat, lng) => {
            this.center.lat = lat;
            this.center.lng = lng;
            this.center.zoom = 16;
        };

        const updateMarker = (lat, lng) => {
            map.then((map) => {
                if (userMarker) {
                    map.removeLayer(userMarker);
                }

                // Circle
                const circleLocation = new L.LatLng(lat, lng);
                const circleOptions = {
                    color: 'blue'
                };
                userMarker = new L.circleMarker(circleLocation, 5, circleOptions);

                map.addLayer(userMarker);
            });
        };

        const getPlusCode = (lat,lng) => {
            MapService.getPlusCode(lat,lng).then((data) => {
                console.log(data);
            }).catch((error) => {
                console.log(error);
            });
        };

        map.then((map) => {
            setTimeout(() => {
                map.invalidateSize();
            }, 0);
        });

        getLocation();
    }
})();
