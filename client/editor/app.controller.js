(function () {
    'use strict';
    angular.module('app')
        .controller('DemoController', function ($scope, $timeout, $http, $localStorage, $mdToast) {
            console.log("Loaded");

            this.getPoiUserPosition = function (page, limit){
                return new Promise(function (resolve, reject){
                    $http({
                        url: `/api/poi?page=${page}&limit=${limit}&clips=false`,
                        method: 'GET'
                    }).then(function successCallback(response){
                        resolve(response);
                    }, function errorCallback(response){
                        reject(response);
                    });
                })
            };

            $scope.listId = [];
            $scope.myFile = null;
            $scope.purp = null;
            $scope.lan = null;
            $scope.cont = null;
            $scope.adnc = null;
            $scope.det = null;
            $scope.selectedId = null;
            this.getPoiUserPosition(0,20)
                .then((data)=>{
                    let item = data['data']['data'];
                    $scope.listId=item;
                })

            const showToast = (message) => {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent(message)
                        .position('top center')
                        .hideDelay(3000)
                );
            };

            $scope.submit=function() {
                var d = new Date();
                var fileName;
                fileName = 'audio_recording_' + d.getTime().toString() + ".mp3";

                var formData = new FormData();
                var request = new XMLHttpRequest();
                var blob = $scope.recorded;
              //  var blob = new Blob([$scope.upFile], { type: "audio/mp3"});

                formData.append("audio", blob, fileName);
                formData.append("purpose", $scope.purp);
                formData.append("language", $scope.lan);
                formData.append("content", $scope.cont);
                formData.append("audience", $scope.adnc);
                formData.append("detail", $scope.det);
                formData.append("poi", $scope.selectedId);

                request.open("POST", "/api/clip", true);
                request.setRequestHeader("Authorization", ($localStorage.currentUser ? ("Bearer " + $localStorage.currentUser.token) : ''));

                request.onreadystatechange = function() {
                    if (request.readyState === 4) {
                        let { response } = request;
                        response = JSON.parse(response);
                        if (response.code === 401) {
                            showToast("Login as editor to upload a clip");
                        } else if (response.code) {
                            showToast(response.message);
                        } else {
                            showToast("Clip uploaded successfully");
                        }
                    }
                };

                request.send(formData);
                return false;
            }
        })


        .config(function (recorderServiceProvider) {
            recorderServiceProvider
                .forceSwf(window.location.search.indexOf('forceFlash') > -1)
                .setSwfUrl('lib/recorder.swf')
                .withMp3Conversion(true);


        });

})();