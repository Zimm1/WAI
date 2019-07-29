(function (){
    angular.module('map')
        .controller('MapController', MapController);

    function MapController($scope, leafletData, MapService) {
        const map = leafletData.getMap('map');

        let userMarker;
        var placesMarker = [];

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

        $scope.$on('leafletDirectiveMap.map.click', (event, wrap) => {
            updateUserPosition(wrap.leafletEvent.latlng.lat, wrap.leafletEvent.latlng.lng);
        });

        $scope.$on('wai.map.autocomplete.selected', (event, item) => {
            updateUserPosition(parseFloat(item.lat), parseFloat(item.lon));
        });

        /*$scope.$on('leafletDirectiveMap.map.contextmenu', (event, wrap) => {
                var synt = window.speechSynthesis;
                var utterThis = new SpeechSynthesisUtterance(getTextToSpeech());
                utterThis.voiceURI = 'urn:moz-tts:speechd:Latin?la';
                utterThis.rate = 1;
                utterThis.lang = 'latin';
                synt.speak(utterThis);
        });*/

        const getTextToSpeech = function () {
            return ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod erat ut metus accumsan, ac maximus magna dapibus. Aenean luctus purus ut mauris bibendum, et ullamcorper leo euismod. Integer eget ligula pellentesque, molestie sem eu, rhoncus diam. Fusce malesuada sem ullamcorper feugiat faucibus. Nunc at justo eu neque dignissim pretium quis congue lacus. Donec auctor condimentum tempus. Fusce dapibus metus leo, sit amet elementum nibh dictum et. Etiam consequat leo a enim accumsan convallis. Aenean vitae pulvinar tellus. Curabitur eget sollicitudin risus, ut porttitor dui. Vivamus euismod justo sit amet nisl rhoncus tristique. In tincidunt ipsum eu est dignissim, tincidunt hendrerit justo pretium. Suspendisse finibus elit quis velit fringilla vehicula.\n' +
                '\n' +
                'Curabitur eget elit varius, vulputate lectus eu, placerat libero. Proin id augue velit. Aenean efficitur mi quis est pulvinar, a vestibulum mi volutpat. Praesent pulvinar cursus ligula, sit amet feugiat ligula condimentum at. Curabitur tempus, odio non pretium cursus, elit tortor faucibus velit, consequat condimentum dui tellus vel massa. In vel justo at est pulvinar imperdiet et ac tellus. Fusce volutpat, augue a posuere gravida, enim lectus facilisis augue, nec euismod sem velit eget tortor. Suspendisse a scelerisque leo. Donec rhoncus sodales purus, quis laoreet erat accumsan ac. Maecenas eleifend, libero non bibendum iaculis, ante eros eleifend ipsum, non semper erat risus eu mi. Sed tortor libero, eleifend id interdum id, suscipit quis magna. Morbi sit amet lectus est. Nulla viverra iaculis malesuada. Proin vel feugiat justo, sit amet vulputate metus. Praesent volutpat lorem eu sapien viverra, at ullamcorper orci lobortis. Mauris mollis est vel risus ullamcorper iaculis.\n' +
                '\n' +
                'Donec iaculis sem nunc, at maximus risus imperdiet in. Nam mattis orci eu felis iaculis, sed ornare metus imperdiet. Cras at libero eget nunc vestibulum facilisis et quis augue. Curabitur condimentum nisl sed consequat cursus. Maecenas fermentum massa a dui fringilla, nec fringilla sem molestie. Nulla eros leo, aliquam nec velit in, malesuada luctus dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vestibulum vestibulum magna eu eleifend vestibulum. Morbi tempus congue nibh, eu tempor lectus aliquam eu. Sed non porttitor dui. Pellentesque mattis ipsum quis erat faucibus imperdiet. Maecenas ultricies dui nec auctor suscipit. Ut ac sem est.\n' +
                '\n' +
                'Vivamus ac felis facilisis, fermentum nisi a, congue leo. Etiam condimentum lectus nulla, vel mollis velit suscipit vitae. Ut quis urna at neque tincidunt malesuada in porttitor tellus. Duis dapibus lacus non ante dapibus, id aliquet dolor hendrerit. Vestibulum cursus, velit non viverra malesuada, nibh purus tempus lectus, et hendrerit est ex vel tellus. Suspendisse lobortis neque eu pulvinar dapibus. Vestibulum enim arcu, porttitor vel lobortis et, porta id ex. Fusce finibus a odio sit amet varius. Aliquam volutpat nisl sit amet dictum blandit. Quisque euismod pharetra dui sit amet ornare. Vivamus gravida sollicitudin nunc.\n' +
                '\n' +
                'Nam eu varius nisi. Fusce porta semper sem a consectetur. Cras sapien neque, faucibus quis ex sed, blandit viverra mauris. Phasellus in ipsum ante. Curabitur eu ullamcorper nibh. Aliquam facilisis felis vitae lorem laoreet, sed pulvinar tellus porta. Curabitur mollis tempus sem, vel';
        }

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

        const getLangLinks = function (pageTitle, linkLimits, lang, pageContinue){
            return MapService.getLangLinks(pageTitle, linkLimits,lang, pageContinue).then(function (data){
                console.log(data);
                return data;
            }).catch(function (error) {
                console.log(error);
                return[];
            });
        };

        const getPageText = function (lang, pageTitle, numSentences){
            return MapService.getPageText(lang, pageTitle, numSentences).then(function (data){
                console.log(data);
                return data;
            }).catch( function (error) {
                console.log(error);
                return [];
            });
        };

        map.then((map) => {
            setTimeout(() => {
                map.invalidateSize();
            }, 0);
        });

        window.speechSynthesis.onvoiceschanged = e => {
            const voices = window.speechSynthesis.getVoices();
            console.log(voices);
        };
        window.speechSynthesis.getVoices();

        getLocation();
    }
})();
