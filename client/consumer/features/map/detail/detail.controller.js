(function (){
    angular.module('map')
        .controller('DetailController', DetailController);

    function DetailController($scope, $mdSidenav, $rootScope, $mdToast, MapService, ngYoutubeEmbedService, PoiService, PlayerService) {
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

        const showToast = (message) => {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .position('top center')
                    .hideDelay(3000)
            );
        };
        
        this.toggleLeft = (item) => {
            $mdSidenav('detailSidenav').toggle().then(function (data) {
                if(item != null){
                    showPoi(item);
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

        const getSidenavWidth = () => {
            return document.getElementById("sidenavDetail").clientWidth - 14;
        };

        this.playWhat = () => {
            this.clickedWhereIam = true;
            let url = PlayerService.whereIam(this.poiObj.geoloc);
            if(url) {
                this.videoID = url;
            } else {
                this.videoID = '';
                showToast('Clip not found');
            }
        }

        this.playLess = () => {
            let url = PlayerService.lessDetail(this.poiObj.geoloc);
            if(url) {
                this.videoID = url;
            } else {
                this.videoID = '';
                showToast('Clip not found');
            }
        }

        this.playMore = () => {
            let url = PlayerService.moreDetail(this.poiObj.geoloc);
            if(url) {
                this.videoID = url;
            } else {
                this.videoID = '';
                showToast('Clip not found');
            }
        }

        this.playHow = () => {
            let url = PlayerService.howClip(this.poiObj.geoloc);
            if(url) {
                this.videoID = url;
            } else {
                this.videoID = '';
                showToast('Clip not found');
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

            if(!lang || !this.poiObj.name || !this.poiObj.lang) {
                showToast('Loading...');
                return;
            }

            getLangLinks(this.poiObj.name, 1, lang, this.poiObj.lang).then((data) => {
                let itr = data['data']['query']['pages'];
                angular.forEach(itr, (key, value) => {
                    if((key.langlinks === null || key.langlinks === undefined) && (lang !== this.poiObj.lang || value === "-1")){
                        console.log("error!");
                        updateText(this.poiObj.name, null);
                        return;
                    }
                    let title;
                    if(lang !== this.poiObj.lang){
                        lang = key.langlinks[0]['lang'];
                        title = key.langlinks[0]['*'];
                    } else {
                        title = this.poiObj.name;
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

         const showPoi = (idPoi) => {
             this.poiObj = PoiService.getPoi(idPoi);
             this.clickedWhereIam = false;

             PlayerService.initClipList(idPoi);
             MapService.getPoiDefaultName(this.poiObj.geoloc).then((name) => {
                 this.poiObj.lang = name[0];
                 this.poiObj.name = name[1];
                 getPageImages(this.poiObj.lang, this.poiObj.name, getSidenavWidth()).then((data) => {
                     angular.forEach(data['data']['query']['pages'], (value, key) => {
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
             }).catch((error) => {
                console.error(error);
                showToast('Too Many Requests')
                this.closeSidenav();
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
            showPoi(item);
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
                showPoi(item);
            }
        });
    }

})();
