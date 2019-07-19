(function(){
    angular.module('map', [
        'ngMaterial',
        'leaflet-directive'
    ])
    .directive('waiMapAutocomplete', () => {
        return {
            templateUrl: 'features/map/autocomplete/autocomplete.view.html',
            controller: 'AutocompleteController',
            controllerAs: 'ctrl'
        };
    });
})();
