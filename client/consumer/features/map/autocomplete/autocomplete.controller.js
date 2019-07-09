(function (){
    angular.module('map')
        .controller('AutocompleteController', AutocompleteController);

    function AutocompleteController($rootScope, leafletData, MapService) {
        this.isDisabled = false;
        this.noCache = true;
        this.searchText = '';
        this.minLength = 3;

        this.getQueryResult = (searchText) => {
          return MapService.getQueryResult(searchText)
              .then((data) => {
                  return data['data'];
              })
              .catch((error) => {
                console.log(`getQueryResult: ${error}`);
                return [];
              });
        };

        this.itemSelectedChanged = (item) => {
            if (!item) {
                return;
            }

            $rootScope.$broadcast('wai.map.autocomplete.selected', item);
        };
    }
})();
