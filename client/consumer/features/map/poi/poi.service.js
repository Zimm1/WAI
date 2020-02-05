(function () {
    angular.module('map')
        .service('PoiService', PoiService);

    function PoiService($rootScope, MapService) {
        this.listPoi = [];
        this.cachePoi = new Set();
        this.page = 0;
        this.count = 0;
        this.index = -1;

        const updateList = (newList) => {
            this.listPoi = newList;
            this.index = 0;
        };

        this.getPoi = (index) => {
            return this.listPoi[index];
        };

        this.setIndex = (index) => {
            this.index = index;
        };

        const getPoiByIndex = (index) => {
            return this.listPoi[index];
        };

        const hasPoi = (poi) => {
            return this.cachePoi.has(poi);
        };

        const addPoiToCache = (poi) => {
            this.cachePoi.add(poi);
        };
        
        const setCount = (count) => {
            this.count = count;
        };
        

        const getPoiUserPosition = function (lat, lng, page, limit) {
            return MapService.getPoiUserPosition(lat.toFixed(9), lng.toFixed(9), page, limit).then(function (data) {
                console.log(data);
                this.count = data['data']['count'];
                return data['data']['data'];
            }).catch(function (error){
                console.log(error);
                return [];
            });
        };

        this.update = (lat, lng, page, limit) => {
            getPoiUserPosition(lat, lng, page, limit).then(function (data){
                updateList(data);
                $rootScope.$broadcast('wai.poiservice.showpoi', JSON.stringify(data));
            });
        };

        this.whereAmI = (lat, lng, page, limit) => {
            //esegui clip audio
        };

        this.nextPoi = (lat, lng, limit) => {
            this.update(lat, lng, this.page, limit).then(function (data){
                for(let i = 0; i < data.length; i++){
                    if(!hasPoi(data[i])) {
                        addPoiToCache(data[i]);
                        $rootScope.$broadcast('wai.poiservice.item', i);
                        break;
                    }
                }
            });
        };

        this.previousPoi = () => {
            if(this.index > 0){
                this.index--;
                $rootScope.$broadcast('wai.poiservice.item', this.index);
            }
        };

    }
})();
