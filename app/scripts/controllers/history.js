'use strict';

angular.module('bars.ctrl.history', [
	])
	.controller('HistoryCtrl',
		['$scope', 'API.Transaction', 'history',
			function($scope, Transaction, history) {
				$scope.bar.active = 'history';
				$scope.history = history;
				$scope.updateHistory = function() {
					return Transaction.query().then(function(data){
						$scope.history = data;
					});
				};
		}
	])
;
