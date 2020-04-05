(function(){
    angular.module('toolbar')
        .controller('ToolbarController', ToolbarController);

    function ToolbarController($rootScope, $location, $window, AuthService) {
        this.menuClick = () => {
            $rootScope.$broadcast('toolbar.menuClick');
        };

        const getBase = (url) => {
            let arr = url.split('/');
            return arr[0] + '//' + arr[2];
        }

        this.loadEditor = () => {
            let oldHref = $window.location.href;
            let base = getBase(oldHref);
            $window.location.assign(base + '/editor');
        }

        this.loadHome = () => {
            let oldHref = $window.location.href;
            let base = getBase(oldHref);
            $window.location.assign(base + '/');
        }

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
