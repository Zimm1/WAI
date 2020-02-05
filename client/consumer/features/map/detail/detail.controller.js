(function (){
    angular.module('map')
        .controller('DetailController', DetailController);

    function DetailController($scope, $mdSidenav, MapService, PoiService) {
        this.whiteframe = 4;
        this.poiObj = {};
        this.title = "";
        this.text = "";
        this.imgLink = "";
        this.imgHeight = "";
        
        this.toggleLeft = () => {
            $mdSidenav('detailSidenav').toggle();
        };

        this.closeSidenav = () => {
            $mdSidenav('detailSidenav').close();
        };

        this.isOpenSidenav = () => {
            return $mdSidenav('detailSidenav').isOpen();
        };

        this.nextPoi = () => {
            PoiService.nextPoi();
        };

        this.previousPoi = () => {
            PoiService.previousPoi();
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

         const showPoi = (index) => {
             this.poiObj = PoiService.getPoi(index);
             getPageImages(this.poiObj.name, 300).then(function (data) {
                 angular.forEach(data['data']['query']['pages'], function (value, key){
                     let link = value['thumbnail']['source'];
                     let height = value['thumbnail']['height'];

                     updateImgAttr(link, height);
                 });
             });

             getLangLinks(this.poiObj.name, 10, 'it').then(function (data){
                 angular.forEach(data['data']['query']['pages'], function (key, value){
                     if(key.langlinks === null || key.langlinks === undefined){
                         console.log("error!");
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
         }

        $scope.$on('wai.poiservice.item', (event, item) => {
            showPoi(item);
        });

        $scope.$on('wai.detail.toggle', (event, item) => {
            console.log("hello there!");
            showPoi(item);

            if(!this.isOpenSidenav()){
                this.toggleLeft();
            }
        });

        console.log($scope);

    }

})();
