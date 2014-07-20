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
			$scope.devURL = function(url) {
				$scope.response = {
					state: 1
				};
				$http({method: 'GET', url: API.route(url)}).
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