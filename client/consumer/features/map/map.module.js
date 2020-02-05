(function(){
    angular.module('map', [
        'ngMaterial',
        'leaflet-directive'
    ])
    .directive('waiDetail', () => {
        return {
            templateUrl: 'features/map/detail/detail.view.html',
            controller: 'DetailController',
            controllerAs: 'dtlCtrl'
        };
    })
    .directive('waiMapAutocomplete', () => {
        return {
            templateUrl: 'features/map/autocomplete/autocomplete.view.html',
            controller: 'AutocompleteController',
            controllerAs: 'ctrl'
        };
    });
})();
