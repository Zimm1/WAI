(function(){
    angular.module('toolbar', [
        'ngMaterial',
        'auth'
    ])
    .directive('waiToolbar', function() {
        return {
            templateUrl: '../common/features/toolbar/toolbar.view.html',
            controller: 'ToolbarController',
            controllerAs: 'ctrl',
            scope: {
                title: "@"
            }
        };
    });
})();
