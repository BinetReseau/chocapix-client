'use strict';

angular.module('bars.ctrl.food', [])
	.controller(
		'FoodDetailCtrl',
		['$scope', '$stateParams', 'API.Food', 'foodDetails',
		function($scope, $stateParams, Food, foodDetails) {
			$scope.FoodDetails = foodDetails;
			$scope.queryQty = 1;
			$scope.queryType = 'buy';
			$scope.query = function(qty, type) {
				if (type == 'buy') {
					var Transaction = Food.buy({item: $stateParams.id, qty: qty}, function () {
						for (var  i = 0 ; i < Transaction.operations.length ; i++) {
							if (Transaction.operations[i].type == 'stockoperation' && Transaction.operations[i].item.id == $stateParams.id) {
								$scope.FoodDetails = Transaction.operations[i].item;
							} else if (Transaction.operations[i].type == 'accountoperation') {
								$scope.user.account.money = Transaction.operations[i].account.money;
							}
						}
					});
				} else if (type == 'throw') {
					var Transaction = Food.throwaway({item: $stateParams.id, qty: qty}, function () {
						for (var  i = 0 ; i < Transaction.operations.length ; i++) {
							if (Transaction.operations[i].type == 'stockoperation' && Transaction.operations[i].item.id == $stateParams.id) {
								$scope.FoodDetails = Transaction.operations[i].item;
							}
						}
					});
				}
			};
		}])
;