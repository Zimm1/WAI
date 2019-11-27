(function (){
    angular.module('map')
        .controller('MapController', MapController);

    function MapController($scope, leafletData, MapService) {
        const map = leafletData.getMap('map');

        const vehicle = {
            WALKING: 0,
            DRIVING: 1,
            CYCLING: 2,
            properties: {
                0: {name: "walking", value: 0, code: "mapbox/walking"},
                1: {name: "driving", value: 1, code: "mapbox/driving"},
                2: {name: "cycling", value: 2, code: "mapbox/cycling"}
            }
        };

        let userMarker;
        let myRoute;
        let poiMarkers = [];

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
                enable: ['zoomstart', 'drag', 'dblclick', 'mousemove'],
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

        $scope.$on('leafletDirectiveMap.map.dblclick', (event, wrap) => {
            updateUserPosition(wrap.leafletEvent.latlng.lat, wrap.leafletEvent.latlng.lng);
        });

        $scope.$on('wai.map.autocomplete.selected', (event, item) => {
            if(!userMarker || !myRoute){
                return;
            }
            let destinationCoord = new L.LatLng(parseFloat(item.lat), parseFloat(item.lon));
            updateRoute(userMarker.getLatLng(), destinationCoord);
        });

        const getLocation = () => {
            map.then((map) => {
                map
                    .locate({setView: true, enableHighAccuracy: true})
                    .on('locationfound', (e) => {
                        updateUserPosition(e.latlng.lat, e.latlng.lng);
                        map.invalidateSize();
                    });
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

                let redIcon = new L.Icon({
                    iconUrl: 'common/assets/png/marker-icon-red.png',
                    shadowUrl: 'common/assets/png/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });


                // Marker
                const markerLocation = new L.LatLng(lat, lng);
                const markerOptions = {
                    icon: redIcon,
                    draggable: 'true'
                };
                userMarker = L.marker(markerLocation, markerOptions);

                userMarker.on('dragend', function (){
                    updateUserPosition(userMarker.getLatLng().lat, userMarker.getLatLng().lng);
                    let myWaypoints = myRoute.getWaypoints();
                    if(myWaypoints[1].latLng){
                        updateRoute(userMarker.getLatLng(), null, vehicle.CYCLING);
                    }
                    map.invalidateSize();
                });

                map.addLayer(userMarker);
                getPoiUserPosition(lat, lng,0,10).then(function (data){
                    showPOI(data);
                });
            });
        };

        const getPageImages = function (pageTitle, imageSize) {
            return MapService.getPageImages(pageTitle, imageSize).then(function (data) {
                console.log(data);
                return data;
            }).catch(function (error) {
                console.log(error);
                return[];
            });
        };

        const getLangLinks = function (pageTitle, linkLimits, lang, pageContinue) {
            return MapService.getLangLinks(pageTitle, linkLimits,lang, pageContinue).then(function (data) {
                console.log(data);
                return data;
            }).catch(function (error) {
                console.log(error);
                return[];
            });
        };

        const getPageText = function (lang, pageTitle, numSentences) {
            return MapService.getPageText(lang, pageTitle, numSentences).then(function (data) {
                console.log(data);
                return data;
            }).catch( function (error) {
                console.log(error);
                return [];
            });
        };

        const getPoiUserPosition = function (lat, lng, page, limit) {
            return MapService.getPoiUserPosition(lat, lng, page, limit).then(function (data) {
                console.log(data);
                return data['data']['data'];
            }).catch(function (error){
                console.log(error);
                return [];
            })
        };

        const initRoute = (mode) => {
            //let options = { profile: vehicle.properties[vehicle.WALKING].code };
            let userVehicle = (mode) ? vehicle.properties[mode].code : vehicle.properties[vehicle.WALKING].code;
            map.then( (map) => {
                myRoute = L.Routing.control({
                    router: L.Routing.mapbox('pk.eyJ1IjoidGVjYW5vZ2kiLCJhIjoiY2sybG5pZnl6MDV5bDNjbmxucTV2cDB2MCJ9.evfYalXeyuu-yEYoJ_4oEg', {
                            profile:userVehicle
                        }),
                    waypoints: [],
                    createMarker: function(index, waypoint, n) {
                        let blueIcon = new L.Icon({
                            iconUrl: 'common/assets/png/marker-icon-blue.png',
                            shadowUrl: 'common/assets/png/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        });
                        if(index === 0){
                            return null;
                        } else {
                            return L.marker(waypoint.latLng, {
                                draggable: true,
                                icon: blueIcon
                            });
                        }
                    },
                    show: false
                }).addTo(map);
            });
        };

        const updateRoute = (from, to, mode) => {
            myRoute.show();

            if(mode){
                myRoute.getRouter().options.profile = vehicle.properties[mode].code;
            }

            if(from){
                myRoute.spliceWaypoints(0,1,from);
            }

            if(to){
                myRoute.spliceWaypoints(1,1,to);
            }

        };

        const removeRoute = () => {
            map.then((map) => {
                myRoute.hide();
                map.removeControl(myRoute);
                myRoute = null;
            });
        };

        const clearRoute = () => {
            myRoute.setWaypoints([]);
            myRoute.hide();
        };

        const createAwesomeIcon = (listCat) => {
            let item = listCat[0];
            return L.AwesomeMarkers.icon(item.icon)
        };

        const showPOI = (listPOI) => {
            map.then((map) => {
                for(let i = 0; i < poiMarkers.length; i++){
                    map.removeLayer(poiMarkers[i]);
                }
                poiMarkers = [];
                L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';
                for(let i = 0; i < listPOI.length; i++){
                    let item = listPOI[i];
                    let marker = L.marker([item.location.lat, item.location.lng], {icon: createAwesomeIcon(item['categories'])});
                    getPageImages(item.name, 100).then(function (data){
                        angular.forEach(data['data']['query']['pages'], function (value, key){
                            let myLink = value['thumbnail']['source'];
                            let width = value['thumbnail']['width'];
                            let height = value['thumbnail']['height'];
                            let popupHTML = `
                                <div>
                                    <img src="${myLink}" width="${width}" height="${height}">
                                    <span>
                                        <strong>${item.name}</strong>
                                    </span>
                                </div>
                            `;
                            marker.bindPopup(popupHTML, {
                                maxWidth: 700,
                                closeButton: false,
                                className: 'popupStyle'
                            });
                        });
                    });

                    marker.on('mouseover', function (e){
                        this.openPopup();
                    });

                    marker.on('mouseout', function (e){
                        this.closePopup();
                    });

                    map.addLayer(marker);
                    poiMarkers.push(marker);
                }
            });
        };

        map.then((map) => {
            setTimeout(() => {
                map.invalidateSize();
                initRoute();
            }, 0);
        });

        getLocation();
    }
})();
