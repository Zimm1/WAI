(function () {
    angular.module('map')
        .service('PlayerService', PlayerService);

    function PlayerService(PoiService) {
        this.listClip = [];
        this.poiGeoloc = '';
        this.detail = 0;
        this.cache = new Set();

        this.initClipList = (poiGeoloc) => {
            let item = PoiService.getPoi(poiGeoloc);
            this.listClip = item.clips;
            this.poiGeoloc = poiGeoloc;
            this.cache.clear();
        };

        this.whereIam = (poiGeoloc) => {
            if(poiGeoloc === this.poiGeoloc) {
                this.clickedWhereIam = true;
                for(let clip of this.listClip) {
                    if(clip.purpose.toLowerCase() === 'what'){
                        return clip.url;
                    }
                }
            }
            return null;
        }

        this.moreDetail = (poiGeoloc) => {
            if(poiGeoloc === this.poiGeoloc) {
                if(this.detail < 3){
                    this.detail++;
                }
                for(let clip of this.listClip) {
                    if(clip.purpose.toLowerCase() === 'why' && this.detail === clip.detail) {
                        return clip.url;
                    }
                }
            }
            return null;
        }

        this.lessDetail = (poiGeoloc) => {
            if(poiGeoloc === this.poiGeoloc) {
                if(this.detail > 1){
                    this.detail--;
                }
                for(let clip of this.listClip) {
                    if(clip.purpose.toLowerCase() === 'why' && this.detail === clip.detail) {
                        return clip.url;
                    }
                }
            }
        }

        this.howClip = (poiGeoloc) => {
            if(poiGeoloc === this.poiGeoloc) {
                for(let clip of this.listClip) {
                    if(clip.purpose.toLowerCase() === 'how' && !this.cache.has(clip.url)){
                        this.cache.add(clip.url);
                        return clip.url;
                    }
                }
            }
        }

    }
})();
