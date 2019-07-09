(function(){

    angular.module('auth')
        .controller('AuthController', AuthController);

    function AuthController($scope, $location, AuthService) {
        this.login = true;
        this.loading = false;
        this.error = null;

        this.toggleMode = () => {
            this.login = !this.login;
        };

        this.signIn = (user) => {
            this.loading = true;

            if (this.login) {
                logIn(user);
            } else {
                signUp(user);
            }
        };

        this.getCurrentUser = () => {
            return AuthService.getCurrentUser();
        };

        this.errorCloseClick = () => {
            this.error = null;
        };

        const logIn = (user) => {
            AuthService.logIn(user.username, user.password).then((user) => {
                $location.path('/');
            }).catch((message) => {
                setError(message);
            }).then(() => {
                stopLoading();
            });
        };

        const signUp = (user) => {
            AuthService.signUp(user.username, user.email, user.password).then((user) => {
                $location.path('/');
            }).catch((message) => {
                setError(message);
            }).then(() => {
                stopLoading();
            });
        };

        const setError = (message) => {
            this.error = message;
            setFocus();
        };

        const setFocus = () => {
            angular.element(document.querySelector('#focus-input')).focus();
        };

        const stopLoading = () => {
            this.loading = false;
            $scope.$apply();
        };
    }

})();
