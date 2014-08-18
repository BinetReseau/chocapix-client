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
			$scope.trashIt = function() {
				if ($scope.foodDetails.deleted) {
					$scope.foodDetails.unMarkDeleted();
					// $scope.foodDetails.unremove({id: $scope.foodDetails.id}).$promise.then(function(newFood) {
					// 	$events.$broadcast('bars.food.update', newFood);
					// });
				} else {
					$scope.foodDetails.markDeleted();
					// $scope.foodDetails.remove({id: $scope.foodDetails.id}).$promise.then(function(newFood) {
					// 	$events.$broadcast('bars.food.update', newFood);
					// });
				}
			};

			// $scope.$on('bars.food.update', function(evt, food){
			// 	if(food.id === $scope.foodDetails.id) {
			// 		$scope.foodDetails.$reload();
			// 	}
			// });
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
