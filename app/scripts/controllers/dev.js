'use strict';

angular.module('bars.ctrl.dev', [
    ])
    .controller('DevCtrl',
        ['$scope',
        '$http',
        'API',
        function($scope, $http, API) {
            $scope.bar.active = 'index';
            $scope.response = {
                state: 0
            };
            $scope.url = '';
            $scope.type = 'GET';
            $scope.data = '';
            $scope.devURL = function(url) {
                var request = {
                    method: $scope.type,
                    url: API.route(url)
                };
                if ($scope.type == 'POST') {
                    var queryString = {};
                    $scope.data.replace(
                      new RegExp(
                        "([^?=&]+)(=([^&#]*))?", "g"),
                        function($0, $1, $2, $3) { queryString[$1] = $3; }
                      );
                    request.data = queryString;
                }
                $scope.response = {
                    state: 1
                };
                $http(request).
                    success(function(data, status, headers) {
                        $scope.error = false;
                        $scope.response = {
                            data: data,
                            status: status,
                            headers: headers,
                            state: 2
                        };
                        console.log($scope.response);
                    }).
                    error(function(data, status, headers) {
                        $scope.error = true;
                        $scope.response = {
                            data: data,
                            status: status,
                            headers: headers,
                            state: 2
                        };
                    });
            };
        }
    ])
;
