'use strict';

angular.module('bars.ctrl.food', [])
	.controller(
		'FoodDetailCtrl',
		['$scope', '$stateParams', 'API.Action', 'foodDetails', 'foodHistory',
		function($scope, $stateParams, APIAction, foodDetails, foodHistory) {
			$scope.foodDetails = foodDetails;
			$scope.history = foodHistory;
			$scope.queryQty = 1;
			$scope.queryType = 'buy';
			$scope.query = function(qty, type) {
				if (type == 'buy') {
					APIAction.buy({item: $scope.foodDetails.id, qty: qty}).$promise.then(function(transaction){
						$scope.$emit('bars_update_food', $scope.foodDetails.id);
						$scope.$emit('bars_update_account', $scope.user.account.id);
						$scope.$emit('bars_update_history', transaction.id);
					});
				} else if (type == 'throw') {
					APIAction.throwaway({item: $scope.foodDetails.id, qty: qty}).$promise.then(function(transaction){
						$scope.$emit('bars_update_food', $scope.foodDetails.id);
						$scope.$emit('bars_update_history', transaction.id);
					});
				}
			};

			$scope.$on('bars_update_food', function(evt, id){
				if(id === $scope.foodDetails.id) {
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
