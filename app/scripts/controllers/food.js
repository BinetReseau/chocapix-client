'use strict';

angular.module('bars.ctrl.food', [])
	.controller(
		'FoodDetailCtrl',
		['$scope', '$stateParams', 'API.Action', 'foodDetails', 'foodHistory', 'API.Food', 'API.Transaction',
		function($scope, $stateParams, APIAction, foodDetails, foodHistory, Food, Transaction) {
			$scope.foodDetails = foodDetails;
			$scope.history = foodHistory;
			$scope.queryQty = 1;
			$scope.queryType = 'buy';
			$scope.query = function(qty, type) {
				if (type == 'buy') {
					APIAction.buy({item: $scope.foodDetails.id, qty: qty}).$promise.then(function(transaction){
						$scope.$emit('bars_update_food', $scope.foodDetails);
						$scope.$emit('bars_update_account', $scope.user.account);
						$scope.$emit('bars_update_history', transaction);
					});
				} else if (type == 'throw') {
					APIAction.throwaway({item: $scope.foodDetails.id, qty: qty}).$promise.then(function(transaction){
						$scope.$emit('bars_update_food', $scope.foodDetails);
						$scope.$emit('bars_update_history', transaction);
					});
				}
			};

			$scope.$on('bars_update_food', function(evt, o){
				if(o.id === $scope.foodDetails.id) {
					Food.get({id: $stateParams.id}).$promise.then(function(o){
						$scope.foodDetails = o;
					});
				}
			});
			// $scope.$on('bars_update_history', function(evt, o){
			// 	Transaction.byItem({id: $stateParams.id}).$promise.then(function(o){
			// 		$scope.history = o;
			// 	});
			// });
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
