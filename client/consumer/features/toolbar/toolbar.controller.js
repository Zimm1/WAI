(function(){
    angular.module('toolbar')
        .controller('ToolbarController', ToolbarController);

    function ToolbarController($scope, $rootScope, $location, AuthService) {
        this.menuClick = () => {
            $rootScope.$broadcast('toolbar.menuClick');
        };

        this.signInClick = () => {
            if (this.getCurrentUser()) {
                AuthService.logout();
                return;
            }

            $location.path('/signin');
        };

        this.getCurrentUser = () => {
            return AuthService.getCurrentUser();
        };
    }

})();
