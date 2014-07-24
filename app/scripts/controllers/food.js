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
						$events.$broadcast('bars.action.buy', [$scope.foodDetails, $scope.user.account, transaction]);
					});
				} else if (type == 'throw') {
					APIAction.throwaway({item: $scope.foodDetails.id, qty: qty}).$promise.then(function(transaction){
						$events.$broadcast('bars.action.throw', [$scope.foodDetails, transaction]);
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
		}])
	.controller('FoodCtrl',
		['$scope', function($scope) {
			$scope.bar.active = 'food';
		}])
;
