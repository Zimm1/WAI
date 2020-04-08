(function () {
    'use strict';
    angular.module('app')
        .controller('DemoController', function ($scope, $timeout, $http, $localStorage, $mdToast, $rootScope, leafletData, AuthService) {
            const map = leafletData.getMap('editor');

            let selectedPlaceMarker;
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

            this.getCurrentUser = () => {
                return AuthService.getCurrentUser();
            }

            const centerView = (latLng) => {
                this.center.lat = latLng.lat;
                this.center.lng = latLng.lng;
            }

            this.updateMarker = (latLng) =>  {
                map.then(map => {
                    if(selectedPlaceMarker) {
                        map.removeLayer(selectedPlaceMarker);
                    }

                    let redIcon = new L.Icon({
                        iconUrl: '../common/assets/png/marker-icon-red.png',
                        shadowUrl: '../common/assets/png/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });

                    // Marker
                    const markerLocation = new L.LatLng(latLng.lat, latLng.lng);
                    const markerOptions = {
                        icon: redIcon,
                        draggable: 'true'
                    };
                    selectedPlaceMarker = L.marker(markerLocation, markerOptions);

                    selectedPlaceMarker.on('dragend', () => {
                        let latLng = selectedPlaceMarker.getLatLng();
                        centerView(latLng);
                        $scope.olc =  OpenLocationCode.encode(latLng.lat.toFixed(6), latLng.lng.toFixed(6));
                    });

                    map.addLayer(selectedPlaceMarker);
                    centerView(latLng);
                });
            }

            $scope.updateDetailValue = () => {
                if($scope.purp !== 'why') {
                    $scope.det = null;
                }
            }

            $rootScope.$on('leafletDirectiveMap.editor.click', (data, wrap) => {
                let latLng = wrap.leafletEvent.latlng;
                this.updateMarker(latLng);
                $scope.olc =  OpenLocationCode.encode(latLng.lat.toFixed(6), latLng.lng.toFixed(6));
                console.log($scope.olc);
            });

            /*
                           North (+90)
                               |
                (-180) West ———+——— East (+180)
                               |
                             South (-90)
            * */
            this.mybounds = {'northEast': {'lat': 90, 'lng': 180},'southWest': {'lat': -90, 'lng': -180}};

            $scope.myFile = null;
            $scope.purp = null;
            $scope.lan = null;
            $scope.cont = null;
            $scope.adnc = null;
            $scope.det = null;
            $scope.selectedId = null;
            $scope.olc = null;

            const showToast = (message) => {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent(message)
                        .position('top center')
                        .hideDelay(3000)
                );
            };

            $scope.submit=function() {
                let d = new Date();
                let fileName;
                fileName = 'audio_recording_' + d.getTime().toString() + ".mp3";

                let formData = new FormData();
                let request = new XMLHttpRequest();
                let blob = $scope.recorded;

                formData.append("audio", blob, fileName);
                formData.append("purpose", $scope.purp);
                formData.append("language", $scope.lan);
                formData.append("content", $scope.cont);
                formData.append("audience", $scope.adnc);
                formData.append("detail", $scope.det ? $scope.det : 0);
                formData.append("geoloc", $scope.olc);

                request.open("POST", "/api/clip", true);
                request.setRequestHeader("Authorization", ($localStorage.currentUser ? ("Bearer " + $localStorage.currentUser.token) : ''));

                request.onreadystatechange = function() {
                    if (request.readyState === 4) {
                        let { response } = request;
                        response = JSON.parse(response);
                        if (response.code === 401) {
                            showToast("Login as editor to upload a clip");
                        } else if (response.code) {
                            showToast(response.message);
                        } else {
                            showToast("Clip uploaded successfully");
                            $scope.myFile = null;
                            $scope.purp = null;
                            $scope.lan = null;
                            $scope.cont = null;
                            $scope.adnc = null;
                            $scope.det = null;
                            $scope.selectedId = null;
                            $scope.olc = null;
                        }
                    }
                };

                request.send(formData);
                return false;
            }
        })


        .config(function (recorderServiceProvider) {
            recorderServiceProvider
                .forceSwf(window.location.search.indexOf('forceFlash') > -1)
                .setSwfUrl('lib/recorder.swf')
                .withMp3Conversion(true);


        });

})();