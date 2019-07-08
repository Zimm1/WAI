(function(){
    angular.module('toolbar', [
        'ngMaterial',
        'auth'
    ])
    .directive('waiToolbar', function() {
        return {
            templateUrl: '/features/toolbar/toolbar.view.html',
            controller: 'ToolbarController',
            controllerAs: 'ctrl',
        };
    });
})();
