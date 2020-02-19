(function () {
    'use strict';

    angular
        .module('auth')
        .factory('AuthService', AuthService);

    function AuthService($localStorage, $mdToast, $http) {
        const service = {};

        service.logIn = (username, password) => {
             return new Promise((resolve, reject) => {
                $http({
                    url: '/api/auth/login',
                    method: 'POST',
                    data: {username, password}
                }).then((response) => {
                    resolve(response);
                }, (err) => {
                    reject(err);
                });
            }).then((response) => {
                if (!response.data.success) {
                    throw {response};
                }

                setCurrentUser({user: response.data.user, token: response.data.token});

                const user = service.getCurrentUser();
                // TODO spostare in altro servizio / implementare ui-router
                showToast("Welcome back, " + user.username);

                return user;
            }).catch((error) => {
                throw error.data.message;
            });
        };

        service.signUp = (username, email, password) => {
            return new Promise((resolve, reject) => {
                $http({
                    url: '/api/auth/signup',
                    method: 'POST',
                    data: {username, email, password}
                }).then((response) => {
                    resolve(response);
                }, (err) => {
                    reject(err);
                });
            }).then((response) => {
                if (!response.data.success) {
                    throw {response};
                }

                setCurrentUser({user: response.data.user, token: response.data.token});

                const user = service.getCurrentUser();
                // TODO spostare in altro servizio / implementare ui-router
                showToast("Welcome back, " + user.username);

                return user;
            }).catch((error) => {
                throw error.data.message;
            });
        };

        service.logout = () => {
            const username = service.getCurrentUser().username;
            removeCurrentUser();
            showToast("See you soon, " + username);
        };

        service.getCurrentUser = () => {
            return $localStorage.currentUser ? $localStorage.currentUser.user : undefined;
        };

        const showToast = (message) => {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .position('top center')
                    .hideDelay(3000)
            );
        };

        const setCurrentUser = (currentUser) => {
            $localStorage.currentUser = currentUser;
            $http.defaults.headers.common.Authorization = 'Bearer ' + currentUser.token;
        };

        const removeCurrentUser = () => {
            delete $localStorage.currentUser;
            $http.defaults.headers.common.Authorization = '';
        };

        return service;
    }
})();