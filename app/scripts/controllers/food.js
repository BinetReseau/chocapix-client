'use strict';

angular.module('bars.ctrl.food', [])
	.controller(
		'FoodDetailCtrl',
		['$scope', '$stateParams', 'API.Food',
		function($scope, $stateParams, Food) {
			$scope.FoodDetails = Food.get({id: $stateParams.id});
			$scope.buyQty = 1;
			$scope.buy = function(qty) {
				var Transaction = Food.buy({item: $stateParams.id, qty: qty}, function () {
					for (var  i = 0 ; i < Transaction.operations.length ; i++) {
						if (Transaction.operations[i].type == 'stockoperation' && Transaction.operations[i].item.id == $stateParams.id) {
							$scope.FoodDetails = Transaction.operations[i].item;
						} else if (Transaction.operations[i].type == 'accountoperation') {
							$scope.user.account.money = Transaction.operations[i].account.money;
						}
					}
				});
			};
		}])
;