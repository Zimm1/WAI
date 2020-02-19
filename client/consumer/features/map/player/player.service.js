(function () {
    angular.module('map')
        .service('PlayerService', PlayerService);

    function PlayerService(MapService) {
        this.listClip = [];
        this.poiID = '';
        this.cache = new Set();

        const setListClip = (listClip) => {
            this.listClip = listClip;
        };

        const updateListClip = (idPoi) => {
            MapService.getAllClip(idPoi).then((data) => {
                let myObj = data['data']['data'];
                let tmpList = myObj['clips'];
                this.poiID = myObj.id;
                setListClip(tmpList);
            }).catch(function (error){
                console.log(error);
            });
        };

        const filter = (clip, listFilter) => {
            if(listFilter === undefined || listFilter.length === 0){
                return true;
            } else {
                for(let i = 0; i < listFilter.length; i++){
                    let item = listFilter[i];
                    if(item === clip){
                        return true;
                    }
                }
            }
            return false;
        };

        this.initClipList = (idPoi) => {
            updateListClip(idPoi);
        };

        this.playFirst = (idPoi, purpose, language) => {
            if(idPoi !== this.poiID){
                return null;
            }

            for(let i = 0; i < this.listClip.length; i++){
                let item = this.listClip[i];
                let idClip = this.listClip[i].audio;

                if(filter(item.purpose, purpose) && filter(item.language, language) && !this.cache.has(idClip)){
                    this.cache.add(idClip);
                    return this.listClip[i].audio;
                }
            }
            return null;
        };

        this.playMore = (idPoi, purpose, language, content, audience, detail) => {
            if(idPoi !== this.poiID){
                return null;
            }

            for(let i = 0; i < this.listClip.length; i++){
                let item = this.listClip[i];
                let idClip = this.listClip[i].audio;

                if(filter(item.purpose, purpose) && filter(item.content, content) && filter(item.language, language) &&
                        filter(item.audience, audience) && filter(item.detail, detail) && !this.cache.has(idClip)){

                    this.cache.add(idClip);
                    return item.audio;
                }
            }
            return null;
        };
    }
})();
