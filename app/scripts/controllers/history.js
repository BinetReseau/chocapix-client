'use strict';

angular.module('bars.ctrl.history', [
	])
	.controller('HistoryCtrl',
		['$scope',
		'API.Transaction',
		'history',
		function($scope, Transaction, history) {
			$scope.bar.active = 'history';
			$scope.history = history;
			$scope.canUpdate = true;
			$scope.updateHistory = function() {
			    $scope.updatingHistory = true;
			    $scope.history =  Transaction.query({}, function () {
				    $scope.updatingHistory = false;
			    });
			};
			$scope.cancelTransaction = function(t) {
				Transaction.cancel({id: t}, null).$promise.then(function(){
					$scope.updateHistory();
				});
			};
		}
	])
;
