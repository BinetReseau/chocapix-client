'use strict';

angular.module('bars.ctrl.food', [])
	.controller(
		'FoodDetailCtrl',
		['$scope', '$stateParams', 'API.Action', 'foodDetails', 'foodHistory', '$events',
		function($scope, $stateParams, APIAction, foodDetails, foodHistory, $events) {
			$scope.foodDetails = foodDetails;
			$scope.history = foodHistory;
			$scope.queryQty = 1;
			$scope.queryType = 'buy';
			$scope.query = function(qty, type) {
				if (type == 'buy') {
					APIAction.buy({item: $scope.foodDetails.id, qty: qty}).$promise.then(function(transaction){
						$events.$broadcast('bars.transaction.new', transaction);
						$scope.queryQty = 1;
					});
				} else if (type == 'throw') {
					APIAction.throwaway({item: $scope.foodDetails.id, qty: qty}).$promise.then(function(transaction){
						$events.$broadcast('bars.transaction.new', transaction);
						$scope.queryQty = 1;
					});
				} else if (type == 'appro') {
					APIAction.appro({item: $scope.foodDetails.id, qty: qty}).$promise.then(function(transaction){
						$events.$broadcast('bars.transaction.new', transaction);
						$scope.queryQty = 1;
					});
				}
			};

			$scope.$on('bars.food.update', function(evt, food){
				if(food.id === $scope.foodDetails.id) {
					$scope.foodDetails.$reload();
				}
			});
		}])
	.controller('FoodListCtrl',
		['$scope', function($scope) {
			$scope.reverse = false;
			$scope.filterDeleted = function() {
				if ($scope.showDeleted) {
					return '';
				} else {
					return {
						deleted: false
					};
				}
			};
		}])
	.controller('FoodCtrl',
		['$scope', function($scope) {
			$scope.bar.active = 'food';
		}])
;
