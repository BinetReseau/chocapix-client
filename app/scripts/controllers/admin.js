'use strict';

angular.module('bars.ctrl.admin', [
	])
	.controller('AdminHomeCtrl',
		['$scope',
		function($scope) {
			$scope.bar.active = 'admin';
		}
	])
;