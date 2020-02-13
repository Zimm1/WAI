(function (){
    angular.module('map')
        .controller('DetailController', DetailController);

    function DetailController($scope, $mdSidenav, $rootScope,MapService, PoiService, PlayerService) {
        this.whiteframe = 4;
        this.poiObj = {};
        this.title = "";
        this.text = "";
        this.imgLink = "";
        this.imgHeight = "";
        this.purposeClip = [
            {name: "what", selected: true}, {name: "how", selected: false}, {name: "why", selected: false}
        ];
        this.selectedPurposeClip = [];
        this.contentClip = [
            {name: "none", selected:false}, {name: "nat", selected: false}, {name: "art", selected: false}, {name: "his", selected: false},
            {name:"flk", selected: false}, {name: "mod", selected: false}, {name: "rel", selected: false}, {name: "cul", selected: false},
            {name: "spo", selected: false}, {name: "mus", selected: false}, {name: "mov", selected: false}, {name: "fas", selected: false},
            {name: "shp", selected: false}, {name: "tec", selected: false}, {name: "pop", selected: false}, {name: "prs", selected: false},
            {name: "oth", selected: false}
        ];
        this.languageClip = [
            {name: "ita", lang: "it",selected: true}, {name: "eng", lang: 'us',selected: false}, {name: "fr", lang: 'fr',selected: false}
        ];
        this.selectedlanguage = [];
        this.selectedContentClip = [];
        this.mode = [{name: "walking", value: 0, selected: true}, {name: "driving", value: 1, selected: false},
            {name: "cycling", value: 2, selected: false}];
        this.selectedMode = '';
        this.videoID = "";
        this.synth = null;
        
        this.toggleLeft = (item) => {
            $mdSidenav('detailSidenav').toggle().then(function (data) {
                showPoi(item, true);
            });
        };

        this.closeSidenav = () => {
            $mdSidenav('detailSidenav').close();
        };

        this.isOpenSidenav = () => {
            return $mdSidenav('detailSidenav').isOpen();
        };

        this.nextPoi = () => {
            let lat = this.poiObj.location.lat;
            let lng = this.poiObj.location.lng;
            PoiService.nextPoi(lat,lng);
        };

        this.previousPoi = () => {
            PoiService.previousPoi(this.poiObj);
        };

        const getDefaultName = () => {
            return this.poiObj.name;
        };

        const getOnlyName = (items) => {
            let tmp = [];
            for(let i = 0; i < items.length; i++){
                let item = items[i];
                tmp.push(item.name);
            }
            return tmp;
        };

        const getSidenavWidth = () => {
            return document.getElementById("sidenavDetail").clientWidth;
        };

        this.playMore = () => {
            let namePurpose = getOnlyName(this.selectedPurposeClip);
            let nameContent = getOnlyName(this.selectedContentClip);
            let nameLanguage = getOnlyName(this.selectedlanguage);
            let myId = this.poiObj.id;
            let newLink = PlayerService.playMore(myId, namePurpose, nameLanguage,nameContent);
            if(newLink !== null){
                this.videoID = newLink;
            }
        };

        this.playFirst= () => {
            let namePurpose = getOnlyName(this.selectedPurposeClip);
            let nameLanguage = getOnlyName(this.selectedlanguage);
            let myId = this.poiObj.id;
            let newLink = PlayerService.playFirst(myId, namePurpose, nameLanguage);
            if(newLink !== null){
                this.videoID = newLink;
            }
        };

        this.startRouting = () => {
            let idDest = this.poiObj.id;
            let mode =  this.selectedMode[0].value;
            $rootScope.$broadcast('wai.map.direction', idDest, mode);
        };

        this.stopRouting = () => {
            $rootScope.$broadcast('wai.map.stopdirection');
        };

        this.updateLanguageText = () => {
            let tmp = this.selectedlanguage[0];
            let lang = tmp.lang;

            getLangLinks(getDefaultName(), 10, lang).then(function (data){
                let itr = data['data']['query']['pages'];
                angular.forEach(itr, function (key, value){
                    if(key.langlinks === null || key.langlinks === undefined){
                        console.log("error!");
                        updateText(getDefaultName(), '');
                        return;
                    }
                    let lang = key.langlinks[0]['lang'];
                    let title = key.langlinks[0]['*'];
                    getPageText(lang, title, 5).then(function (data){
                        angular.forEach(data['data']['query']['pages'], function (key, value){
                            let title = key.title;
                            let extract = key.extract;

                            updateText(title, extract);
                        });
                    });
                });
            });
        };

        this.textSpeak = () => {
            if(!this.synth.speaking){
                let myLang = this.selectedlanguage[0];
                let lang = myLang.lang;
                let utterance = new SpeechSynthesisUtterance(this.text);
                utterance.lang = lang;
                this.synth.speak(utterance);
            }
        };

        this.textCancel = () => {
            if(this.synth.speaking){
                this.synth.cancel();
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

         const showPoi = (idPoi, addToCache) => {
             this.poiObj = PoiService.getPoi(idPoi);
             if(addToCache){
                 PoiService.addToCache(this.poiObj);
             }
             PlayerService.initClipList(idPoi);
             getPageImages(this.poiObj.name, getSidenavWidth()).then(function (data) {
                 angular.forEach(data['data']['query']['pages'], function (value, key){
                     let link = value['thumbnail']['source'];
                     let height = value['thumbnail']['height'];

                     updateImgAttr(link, height);
                 });
             });

             this.updateLanguageText();
         };

         $scope.$on('wai.poiservice.destinationreached', () => {
            this.playFirst();
         });

        $scope.$on('wai.poiservice.item', (event, item, directions) => {
            showPoi(item,false);
            if(directions){
                this.startRouting();
            }
        });

        $scope.$on('wai.detail.toggle', (event, item) => {
            this.videoID = '';
            this.synth = window.speechSynthesis;

            if(!this.isOpenSidenav()){
                this.toggleLeft(item);
                this.textCancel();
            } else {
                showPoi(item,true);
            }
        });
    }

})();
