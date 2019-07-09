(function () {
    'use strict';

    angular
        .module('auth')
        .factory('AuthService', AuthService);

    function AuthService($http, $localStorage, $mdToast) {
        const service = {};

        service.logIn = (username, password) => {
            return new Promise((resolve, reject) => {
                $http.post('/api/auth/login', {username, password})
                    .then((response) => {
                        if (response.data.success) {
                            setCurrentUser({user: response.data.user, token: response.data.token});

                            const user = service.getCurrentUser();
                            resolve(user);
                            // TODO spostare in altro servizio / implementare ui-router
                            showToast("Welcome back, " + user.username);
                        } else {
                            reject(response.data.message);
                        }
                    }, (response) => {
                        reject(response.data.message);
                    });
            });
        };

        service.signUp = (username, email, password) => {
            return new Promise((resolve, reject) => {
                $http.post('/api/auth/signup', {username, email, password})
                    .then((response) => {
                        if (response.data.success) {
                            setCurrentUser({user: response.data.user, token: response.data.token});

                            const user = service.getCurrentUser();
                            resolve(user);
                            // TODO spostare in altro servizio / implementare ui-router
                            showToast("Welcome, " + user.username);
                        } else {
                            reject(response.data.message);
                        }
                    }, (response) => {
                        reject(response.data.message);
                    });
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