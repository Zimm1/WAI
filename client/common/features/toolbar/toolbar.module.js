(function(){
    angular.module('toolbar', [
        'ngMaterial',
        'auth'
    ])
    .directive('waiToolbar', () => {
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
