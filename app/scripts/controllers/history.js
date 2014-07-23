'use strict';

angular.module('bars.ctrl.history', [
	])
	.controller('HistoryCtrl',
		['$scope', 'API.Transaction', 'history',
			function($scope, Transaction, history) {
				$scope.bar.active = 'history';
				$scope.history = history;
				$scope.updateHistory = function() {
					$scope.history = Transaction.query();
					return $scope.history.$promise;
				};
		}
	])
;
