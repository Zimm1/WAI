(function (){
    angular.module('map')
        .controller('DetailController', DetailController);

    function DetailController($scope, $mdSidenav, $rootScope,MapService, ngYoutubeEmbedService, PoiService, PlayerService) {
        this.whiteframe = 4;
        this.numSentences = 5;
        this.poiObj = {};
        this.title = "";
        this.text = "";
        this.imgLink = "";
        this.imgHeight = "";

        this.languageClip = [
            {name: "ita", lang: "it",selected: true}, {name: "eng", lang: 'en',selected: false}, {name: "fr", lang: 'fr',selected: false}
        ];
        this.selectedLanguage = [];

        this.mode = [{name: "walking", value: 0, selected: true}, {name: "driving", value: 1, selected: false},
            {name: "cycling", value: 2, selected: false}];
        this.selectedMode = '';

        this.videoID = "";
        this.synth = null;
        this.clickedWhereIam = false;
        
        this.toggleLeft = (item) => {
            $mdSidenav('detailSidenav').toggle().then(function (data) {
                if(item != null){
                    showPoi(item, true);
                }
            });
        };

        this.closeSidenav = () => {
            $mdSidenav('detailSidenav').close();
        };

        this.isOpenSidenav = () => {
            return $mdSidenav('detailSidenav').isOpen();
        };

        this.nextPoi = () => {
            PoiService.nextPoi(this.poiObj);
        };

        this.previousPoi = () => {
            PoiService.previousPoi();
        };

        const getOnlyName = (items) => {
            let tmp = [];
            for(let i = 0; i < items.length; i++){
                let item = items[i];
                tmp.push(item.name);
            }
            return tmp;
        };

        const getValueDetail = (items) => {
            let tmp = [];
            for(let i = 0; i < items.length; i++){
                let item = items[i];
                tmp.push(item.value);
            }
            return tmp;
        };

        const getSidenavWidth = () => {
            return document.getElementById("sidenavDetail").clientWidth;
        };

        this.playWhat = () => {
            this.clickedWhereIam = true;
            let url = PlayerService.whereIam(this.poiObj.geoloc);
            if(url) {
                this.videoID = url;
            } else {
                this.videoID = '';
            }
        }

        this.playLess = () => {
            let url = PlayerService.lessDetail(this.poiObj.geoloc);
            if(url) {
                this.videoID = url;
            } else {
                this.videoID = '';
            }
        }

        this.playMore = () => {
            let url = PlayerService.moreDetail(this.poiObj.geoloc);
            if(url) {
                this.videoID = url;
            } else {
                this.videoID = '';
            }
        }

        this.playHow = () => {
            let url = PlayerService.howClip(this.poiObj.geoloc);
            if(url) {
                this.videoID = url;
            } else {
                this.videoID = '';
            }
        }

        this.startRouting = () => {
            let idDest = this.poiObj.geoloc;
            let mode =  this.selectedMode[0].value;
            $rootScope.$broadcast('wai.map.direction', idDest, mode);
        };

        this.stopRouting = () => {
            $rootScope.$broadcast('wai.map.stopdirection');
        };

        this.updateLanguageText = () => {
            this.speakCancel();
            let selectedLang = this.selectedLanguage[0];
            let lang = selectedLang.lang;

            MapService.getPoiDefaultName(this.poiObj.geoloc).then((name) => {
                getLangLinks(name[1], 1, lang, name[0]).then((data) => {
                    let itr = data['data']['query']['pages'];
                    angular.forEach(itr, (key, value) => {
                        if((key.langlinks === null || key.langlinks === undefined) && (lang !== name[0] || value === "-1")){
                            console.log("error!");
                            updateText(name[1], null);
                            return;
                        }
                        let title;
                        if(lang !== name[0]){
                            lang = key.langlinks[0]['lang'];
                            title = key.langlinks[0]['*'];
                        } else {
                            title = name[1];
                        }
                        getPageText(lang, title, this.numSentences).then((data) => {
                            angular.forEach(data['data']['query']['pages'], (key, value) => {
                                let title = key.title;
                                let extract = key.extract;

                                updateText(title, extract);
                            });
                        });
                    });
                });
            });
        };

        this.chunks = [];

        this.createChunk = () => {
            let itr = this.text.split(' ');
            let length = 160;
            let phrase = '';

            while(itr.length > 0){
                let word = itr.shift();
                word += ' ';
                if(phrase.length + word.length < length){
                    phrase += word;
                } else {
                    this.chunks.push(phrase);
                    phrase = word;
                }
            }
            this.chunks.push(phrase);
        };

        this.speakChunk = (chunk) => {
            if(!this.synth.speaking){
                let myLang = this.selectedLanguage[0];
                let lang = myLang.lang;
                let utterance = new SpeechSynthesisUtterance(chunk);
                utterance.lang = lang;
                utterance.addEventListener('end', () => {
                    if(this.chunks.length > 0){
                        let item = this.chunks.shift();
                        this.speakChunk(item);
                    }
                });
                this.synth.speak(utterance);
            }
        };

        this.textSpeak = () => {
            if(!this.synth.speaking){
                this.createChunk();
                let item = this.chunks.shift();
                this.speakChunk(item);
            }
        };

        this.speakCancel = () => {
            if(this.synth.speaking){
                this.synth.cancel();
                this.chunks = [];
            }
        };

        const updateImgAttr = (link, height) => {
            this.imgLink = link;
            this.imgHeight = height;
        };

        const updateText = (title, text) => {
            this.title = title;
            this.text = text;
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

        const getLangLinks = function (pageTitle, linkLimits, lang, baseLang,pageContinue) {
            return MapService.getLangLinks(pageTitle, linkLimits,lang, baseLang, pageContinue).then(function (data) {
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

         const showPoi = (idPoi, addToCache) => {
             this.poiObj = PoiService.getPoi(idPoi);
             this.clickedWhereIam = false;

             PlayerService.initClipList(idPoi);
             MapService.getPoiDefaultName(this.poiObj.geoloc).then((name) => {
                 getPageImages(name[0], name[1], getSidenavWidth()).then(function (data) {
                     angular.forEach(data['data']['query']['pages'], function (value, key){
                         let image = value['thumbnail'];
                         let link, height;
                         if(image){
                             link = value['thumbnail']['source'];
                             height = value['thumbnail']['height'];
                         } else {
                             link = "../common/assets/jpg/image-not-available.jpg";
                             height = 400;
                         }

                         updateImgAttr(link, height);
                     });
                 });
                 this.updateLanguageText();
             });
         };

         const stopPlayer = () => {
             this.videoID = '';
         };

         const stopMedia = () => {
            stopPlayer();
            this.speakCancel();
         };

         this.handlerStateChange = function (event) {
            console.log(event);
         };

        this.handlerPlayerReady = function (event) {
            console.log(event);
            event.target.mute();
            event.target.playVideo();
        };

        this.handlerError = function (event) {
            console.log(event);
        };

         $scope.$on('wai.poiservice.destinationreached', () => {
             if(!this.isOpenSidenav()){
                 this.toggleLeft(null)
             }
            this.playWhat();
         });

        $scope.$on('wai.poiservice.item', (event, item, directions) => {
            stopMedia();
            showPoi(item,false);
            if(directions){
                this.startRouting();
            }
        });

        $scope.$on('wai.detail.toggle', (event, item) => {
            this.synth = window.speechSynthesis;
            stopMedia();

            if(!this.isOpenSidenav()){
                this.toggleLeft(item);
            } else {
                showPoi(item,true);
            }
        });
    }

})();
