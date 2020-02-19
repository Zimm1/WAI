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
        this.selectedContentClip = [];

        this.languageClip = [
            {name: "ita", lang: "it",selected: true}, {name: "eng", lang: 'en',selected: false}, {name: "fr", lang: 'fr',selected: false}
        ];
        this.selectedLanguage = [];

        this.mode = [{name: "walking", value: 0, selected: true}, {name: "driving", value: 1, selected: false},
            {name: "cycling", value: 2, selected: false}];

        this.audienceClip = [{name: "gen", selected: false}, {name: "pre", selected: false}, {name: "elm", selected: false},
            {name: "mid", selected: false}, {name: "scl", selected: false}];
        this.selectedAudience = [];

        this.detailClip = [{name: "introduction", value: 0, selected: false}, {name: "low detail", value: 1, selected: false},
            {name: 'medium detail', value: 2, selected: false}, {name: 'high detail', value: 3, selected: false}];
        this.selectedDetail = [];

        this.selectedMode = '';
        this.videoID = "";
        this.synth = null;
        
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

        this.playMore = () => {
            let namePurpose = getOnlyName(this.selectedPurposeClip);
            let nameContent = getOnlyName(this.selectedContentClip);
            let nameLanguage = getOnlyName(this.selectedLanguage);
            let nameAudience = getOnlyName(this.selectedAudience);
            let valueDetail = getValueDetail(this.selectedDetail);
            let myId = this.poiObj.id;
            let newLink = PlayerService.playMore(myId, namePurpose, nameLanguage,nameContent, nameAudience, valueDetail);
            if(newLink !== null){
                this.videoID = newLink;
            } else {
                this.videoID = '';
                //this.videoID = "4Mg7fbki-gA";
            }
        };

        this.playFirst= () => {
            let namePurpose = getOnlyName(this.selectedPurposeClip);
            let nameLanguage = getOnlyName(this.selectedLanguage);
            let myId = this.poiObj.id;
            let newLink = PlayerService.playFirst(myId, namePurpose, nameLanguage);
            if(newLink !== null){
                this.videoID = newLink;
            } else {
                this.videoID = '';
                //this.videoID = 'LDU_Txk06tM';
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
            this.speakCancel();
            let tmp = this.selectedLanguage[0];
            let lang = tmp.lang;

            getLangLinks(getDefaultName(), 1, lang).then((data) => {
                let itr = data['data']['query']['pages'];
                angular.forEach(itr, (key, value) => {
                    if((key.langlinks === null || key.langlinks === undefined) && (lang !== MapService.defaultLangWikipedia || value === "-1")){
                        console.log("error!");
                        updateText(getDefaultName(), null);
                        return;
                    }
                    let title;
                    if(lang !== MapService.defaultLangWikipedia){
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
            this.playFirst();
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
