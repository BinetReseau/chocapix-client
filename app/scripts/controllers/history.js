'use strict';

angular.module('bars.ctrl.history', [
	])
	.controller('HistoryCtrl',
		['$scope', '$filter', 'API.Transaction', 'history',
			function($scope, $filter, Transaction, history) {
				$scope.bar.active = 'history';
				$scope.history = history;

		}
	])
;
