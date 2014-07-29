'use strict';

angular.module('bars.ctrl.admin', [
	])
	.controller('AdminBaseCtrl',
		['$scope',
		function($scope) {
			$scope.admin = {
				active: ''
			};
		}
	])
	.controller('AdminHomeCtrl',
		['$scope',
		function($scope) {
			$scope.admin.active = 'dashboard';
		}
	])
	.controller('AdminFoodCtrl',
		['$scope',
		function($scope) {
			$scope.admin.active = 'food';
		}
	])
;