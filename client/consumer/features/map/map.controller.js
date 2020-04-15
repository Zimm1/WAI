(function (){
    angular.module('map')
        .controller('MapController', MapController);

    function MapController($scope, $rootScope, leafletData, MapService, PoiService) {
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

        $scope.$on('wai.map.autocomplete.selected', (event, item) => {
            let userPosition = new L.LatLng(parseFloat(item.lat), parseFloat(item.lon));
            updateUserPosition(userPosition.lat, userPosition.lng);
        });

        $scope.$on('wai.poiservice.showpoi', (event) => {
            let listPoi = PoiService.getAllPoi();
            showPOI(listPoi);
        });

        $scope.$on('wai.map.direction', (event, idPoi, mode) => {
            let destination = PoiService.getPoi(idPoi);
            let tmpCoord = OpenLocationCode.decode(destination.geoloc);
            let coord = new L.LatLng(tmpCoord.latitudeCenter, tmpCoord.longitudeCenter);
            updateRoute(userMarker.getLatLng(), coord, mode);

            //getLocation();
        });

        $scope.$on('wai.map.stopdirection', (event) => {
           clearRoute();
        });

        const getLocation = () => {
            map.then((map) => {
                map
                    .locate({setView: true, enableHighAccuracy: true})
                    .on('locationfound', (e) => {
                        updateUserPosition(e.latlng.lat, e.latlng.lng);
                        map.invalidateSize();

                        if(myRoute) {
                            let newCoord = new L.LatLng(e.latlng.lat, e.latlng.lng);
                            let myWaypoints = myRoute.getWaypoints();
                            if(myWaypoints[1].latLng){
                                updateRoute(newCoord, null, null);
                            }
                        }
                    })
                    .on('locationerror', (e) => {
                        console.log(e);
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
                    iconSize: [30, 45],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [45, 45]
                });


                // Marker
                const markerLocation = new L.LatLng(lat, lng);
                const markerOptions = {
                    icon: redIcon,
                    draggable: 'true'
                };
                userMarker = L.marker(markerLocation, markerOptions);

                if(myRoute) {
                    let myWaypoints = myRoute.getWaypoints();
                    let destCoord = myWaypoints[1].latLng;
                    if(destCoord){
                        let destinationOlc = OpenLocationCode.encode(destCoord.lat,destCoord.lng);
                        let userPositionOlc = OpenLocationCode.encode(markerLocation.lat.toFixed(6), markerLocation.lng.toFixed(6));
                        let nearOlc = MapService.getOlcsAround(userPositionOlc);
                        for(const item of nearOlc) {
                            if(destinationOlc === item){
                                clearRoute();
                                $rootScope.$broadcast('wai.poiservice.destinationreached');
                                break;
                            }
                        }
                    }
                }

                userMarker.on('dragend', function (){
                    updateUserPosition(userMarker.getLatLng().lat, userMarker.getLatLng().lng);
                    let myWaypoints = myRoute.getWaypoints();
                    if(myWaypoints[1].latLng){
                        updateRoute(userMarker.getLatLng(), null, null);
                    }
                });

                map.addLayer(userMarker);

                let olc = OpenLocationCode.encode(lat, lng);
                MapService.getClips(olc);
            });
        };

        const getPageImages = function (lang, pageTitle, imageSize) {
            return MapService.getPageImages(lang, pageTitle, imageSize).then(function (data) {
                console.log(data);
                return data;
            }).catch(function (error) {
                console.log(error);
                return[];
            });
        };

        const bindMarkerPopUp = (index) => {
            if(index >= poiMarkers.length) {
                return;
            }
            let olc = poiMarkers[index].idPoi;
            MapService.getPoiDefaultName(olc).then((name) => {
                getPageImages(name[0], name[1], 100).then((data) => {
                    angular.forEach(data['data']['query']['pages'], (value, key) => {
                        let tmp = value['thumbnail'];
                        let myLink, width, height;
                        if(tmp){
                            myLink = tmp['source'];
                            width = tmp['width'];
                            height = tmp['height'];
                        } else {
                            myLink = "../common/assets/jpg/image-not-available.jpg";
                            width = 100;
                            height = 100;
                        }

                        let popupHTML = `
                            <div>
                                <img src="${myLink}" width="${width}" height="${height}" />
                                <span><strong>${name[1]}</strong></span>
                            </div>
                        `;
                        poiMarkers[index].bindPopup(popupHTML, {
                            maxWidth: 700,
                            closeButton: false,
                            className: 'popupStyle'
                        });
                        poiMarkers[index].on('mouseover', function (e){
                            this.openPopup();
                        });

                        poiMarkers[index].on('mouseout', function (e){
                            this.closePopup();
                        });
                        bindMarkerPopUp(++index);
                    });
                }).catch((error) => {
                    console.error(error);
                    bindMarkerPopUp(++index);
                });
            }).catch((error) => {
                console.error(error);
                bindMarkerPopUp(++index);
            });
        }

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
                        return null;
                    },
                    show: false
                }).addTo(map);
            });
        };

        const updateRoute = (from, to, mode) => {
            myRoute.show();

            if(mode || mode === 0){
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

        const createAwesomeIcon = (cat) => {
            return L.AwesomeMarkers.icon(cat);
        };

        const showPOI = (listPOI) => {
            map.then((map) => {
                for(let i = 0; i < poiMarkers.length; i++){
                    map.removeLayer(poiMarkers[i]);
                }
                poiMarkers = [];
                L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';
                for(let item of listPOI){
                    let cat = PoiService.getCategoryPoi(item.geoloc);
                    if(OpenLocationCode.isValid(item.geoloc)) {
                        let loc = OpenLocationCode.decode(item.geoloc);

                        let marker = L.marker([loc.latitudeCenter.toFixed(6), loc.longitudeCenter.toFixed(6)], {icon: createAwesomeIcon(cat)});

                        marker.idPoi = item.geoloc;

                        marker.on('click', function (e) {
                            $rootScope.$broadcast('wai.detail.toggle', this.idPoi);
                        });

                        map.addLayer(marker);
                        poiMarkers.push(marker);
                    }
                }
                bindMarkerPopUp(0);
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
