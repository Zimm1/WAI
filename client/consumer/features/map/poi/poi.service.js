(function () {
    angular.module('map')
        .service('PoiService', PoiService);

    function PoiService($rootScope) {
        this.listPoi = new Map();
        this.cachePoi = [];
        this.iconObj = {
            nat: {
                icon: 'leaf',
                markerColor: 'green'
            },
            art: {
                icon: 'palette',
                markerColor: 'orange'
            },
            his: {
                icon: 'monument',
                markerColor: 'orange'
            },
            flk: {
                icon: 'user',
                markerColor: 'green'
            },
            mod: {
                icon: 'book-open',
                markerColor: 'purple'
            },
            rel: {
                icon: 'place-of-worship',
                markerColor: 'purple'
            },
            cui: {
                icon: 'glass-martini',
                markerColor: 'purple'
            },
            spo: {
                icon: 'futbol',
                markerColor: 'green'
            },
            mus: {
                icon: 'music',
                markerColor: 'orange'
            },
            mov: {
                icon: 'film',
                markerColor: 'green'
            },
            fas: {
                icon: 'camera-retro',
                markerColor: 'purple'
            },
            shp: {
                icon: 'shopify',
                markerColor: 'green'
            },
            tec: {
                icon: 'robot',
                markerColor: 'orange'
            },
            pop: {
                icon: 'comment-dots',
                markerColor: 'purple'
            },
            prs: {
                icon: 'people-arrows',
                markerColor: 'green'
            },
            oth: {
                icon: 'plus',
                markerColor: 'green'
            },
            '*': {
                icon: 'asterisk',
                markerColor: 'orange'
            }
        };

        this.createListPoiFromClips = (clipList) => {
            for (let clip of clipList) {
                if (clip.geoloc) {
                    clip.geoloc = clip.geoloc.substring(0, 11);
                }

                if(!OpenLocationCode.isValid(clip.geoloc)){
                    continue;
                }

                if(!this.listPoi.has(clip.geoloc)) {
                    let obj = {
                        geoloc: clip.geoloc,
                        clips: [
                            clip
                        ]
                    };
                    this.listPoi.set(clip.geoloc, obj);
                } else {
                    let poi = this.listPoi.get(clip.geoloc);
                    poi.clips.push(clip);
                    this.listPoi.set(clip.geoloc, poi);
                }
            }
            $rootScope.$broadcast('wai.poiservice.showpoi');
        };

        this.clearMap = () => {
            this.listPoi.clear();
        }

        this.isEmpty = () => {
            return this.listPoi.size === 0;
        };

        this.getPoi = (plusCode) => {
            return this.listPoi.get(plusCode);
        };

        this.addToCache = (poi) => {
            if(!this.hasPoi(poi)){
                this.cachePoi.push(poi);
            }
        };

        this.getAllPoi = () => {
            return this.listPoi.values();
        };

        this.getCategoryPoi = (plusCode) => {
            let poi = this.listPoi.get(plusCode);
            if(poi){
                let listClip = poi.clips;
                let catName = listClip[0]['content'];
                return this.iconObj[catName];
            }
            return null;
        }

        this.hasPoi = (poi) => {
            for(let item of this.cachePoi){
                if(item.geoloc === poi.geoloc){
                    return true;
                }
            }
            return false;
        };

        this.removeFromCache = (poi) => {
            this.cachePoi = this.cachePoi.filter( item => {return item.geoloc !== poi.geoloc});
        }

        this.update = (lat, lng) => {
            //this.createListPoiFromClips(fakeData);
            //$rootScope.$broadcast('wai.poiservice.showpoi');
        };

        this.nextPoi = (poi) => {
            this.addToCache(poi);
            if(!calculateNextPoi(poi.geoloc, 0)) {
                this.removeFromCache(poi);
            }
        }

        const calculateNextPoi = (olc, level) => {
            if(level > 2) {
                return false;
            }

            for(let item of this.listPoi.values()){
                if(item.geoloc.includes(olc) && !this.hasPoi(item)){
                    $rootScope.$broadcast('wai.poiservice.item', item.geoloc, true);
                    return true;
                }
            }

            let newOlc = '';

            if(level === 0) {
                newOlc = olc.substring(0, olc.length - 2);
            } else {
                newOlc = olc.substring(0, olc.length - 3) + '00+';
            }
            return calculateNextPoi(newOlc, ++level);
        }

        this.previousPoi = () => {
            if(this.cachePoi.length > 0) {
                let item = this.cachePoi.pop();
                if(this.getPoi(item.geoloc) === null){
                    this.listPoi.set(item.geoloc, item);
                    $rootScope.$broadcast('wai.poiservice.showpoi', item.geoloc);
                }
                $rootScope.$broadcast('wai.poiservice.item', item.geoloc, true);
            }
        };

    }
})();
