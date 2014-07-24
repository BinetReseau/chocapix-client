'use strict';

angular.module('bars.ctrl.history', [
	])
	.controller('HistoryCtrl',
		['$scope', 'API.Transaction', 'history',
			function($scope, Transaction, history) {
				$scope.bar.active = 'history';
				$scope.history = history;
				$scope.updateHistory = function() {
					return Transaction.query().$promise.then(function(o){
						$scope.history = o;
					});
				};
		        $scope.$on('bars_update_history', function(evt){
		        	$scope.updateHistory();
		        });
		}
	])
;
