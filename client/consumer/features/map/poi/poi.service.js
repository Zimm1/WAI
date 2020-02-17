(function () {
    angular.module('map')
        .service('PoiService', PoiService);

    function PoiService($rootScope, MapService) {
        this.listPoi = [];
        this.cachePoi = [];
        this.page = 0;
        this.limit = 20;
        this.count = 0;

        const updateList = (newList) => {
            this.listPoi = newList;
        };

        this.isEmpty = () => {
            return this.listPoi.length === 0;
        };

        this.getPoi = (idPoi) => {
            for(let i = 0; i < this.listPoi.length; i++){
                let item = this.listPoi[i];
                if(idPoi === item.id){
                    return item
                }
            }
            return null;
        };

        this.getAllPoi = () => {
            return this.listPoi;
        };

        this.addToCache = (poi) => {
            addPoiToCache(poi);
        };

        const hasPoi = (poi) => {
            for(let i = 0; i < this.cachePoi.length; i++){
                let item = this.cachePoi[i];
                if(item.id === poi.id){
                    return true;
                }
            }
            return false;
        };

        const addPoiToCache = (poi) => {
            if(!hasPoi(poi)){
                this.cachePoi.push(poi);
            }
        };

        const getPoiUserPosition = (lat, lng, page, limit) => {
            return MapService.getPoiUserPosition(lat.toFixed(9), lng.toFixed(9), page, limit).then((data) => {
                console.log(data);
                this.count = data['data']['count'];
                return data['data']['data'];
            }).catch(function (error){
                console.log(error);
                return [];
            });
        };

        this.update = (lat, lng) => {
            return getPoiUserPosition(lat, lng, this.page, this.limit).then((data) => {
                updateList(data);
                $rootScope.$broadcast('wai.poiservice.showpoi');
            });
        };

        this.nextPoi = (lat, lng) => {
            this.update(lat,lng).then(()=> {
                let found = false;
                for(let i = 0; i < this.listPoi.length; i++){
                    let item = this.listPoi[i];
                    if(!hasPoi(item)) {
                        found = true;
                        addPoiToCache(item);
                        $rootScope.$broadcast('wai.poiservice.item', item.id, true);
                        break;
                    }
                }
                if (this.count === this.limit && !found) {
                    this.page++;
                    this.nextPoi(lat, lng);
                }
            });
        };

        this.previousPoi = (currPoi) => {
            if(this.cachePoi.length > 0){
                let item = this.cachePoi.pop();
                if(currPoi.id === item.id){
                    this.previousPoi(currPoi);
                } else {
                    if(this.getPoi(item.id) === null){
                        this.listPoi.push(item);
                        $rootScope.$broadcast('wai.poiservice.showpoi', item.id);
                    }
                    $rootScope.$broadcast('wai.poiservice.item', item.id, true);
                }
            }
        };

    }
})();
