(function() {
    // Editor
    angular
        .module('app', [
            'ngMaterial',
            'ngRoute',
            'leaflet-directive',
            'auth',
            'toolbar',
            'users',
            'angularAudioRecorder'
        ])
        .config(($mdThemingProvider, $mdIconProvider) => {
            $mdIconProvider
                .defaultIconSet("../common/assets/svg/avatars.svg", 128)
                .icon("menu"       , "../common/assets/svg/menu.svg"        , 24)
                .icon("share"      , "../common/assets/svg/share.svg"       , 24)
                .icon("google_plus", "../common/assets/svg/google_plus.svg" , 512)
                .icon("hangouts"   , "../common/assets/svg/hangouts.svg"    , 512)
                .icon("twitter"    , "../common/assets/svg/twitter.svg"     , 512)
                .icon("phone"      , "../common/assets/svg/phone.svg"       , 512);

            $mdThemingProvider.theme('default')
                .primaryPalette('deep-orange')
                .accentPalette('grey');

            $mdThemingProvider.theme('error')
                .backgroundPalette('red').dark();
        })
        .config(($routeProvider, $locationProvider) => {
            $routeProvider
                .when("/", {
                    templateUrl : "editor.view.html"
                })
                .when("/signin", {
                    templateUrl : "../common/features/auth/auth.view.html"
                })
                .otherwise({
                    redirectTo: "/"
                });

            $locationProvider.html5Mode(true);
        })
        .run(function ($rootScope) {
            $rootScope.$on('$routeChangeStart', function (event, next, current) {
                console.log('$routeChangeStart: ' + (current ? current.originalPath : 'undefined') + ' to ' + next.originalPath);
            });
        });
})();