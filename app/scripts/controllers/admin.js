'use strict';

angular.module('bars.ctrl.admin', [
	])
	.controller('AdminBaseCtrl',
		['$scope',
		function($scope) {
			$scope.bar.active = 'admin';
			$scope.admin = {
				active: ''
			};
		}
	])
	.controller('AdminHomeCtrl',
		['$scope',
		function($scope) {
			$scope.admin.active = 'dashboard';
		}
	])
	.controller('AdminFoodCtrl',
		['$scope', '$events', 'API.Food',
		function($scope, $events, Food) {
			$scope.admin.active = 'food';
			$scope.food = Food.create();
			$scope.addFood = function(food) {
				Food.store(food).then(function(newFood) {
					$scope.food = Food.create();
					// $events.$broadcast('bars.food.add', newFood);
				});
			};
		}
	])
;
