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
		['$scope',
		'$events',
		'API.Food',
		function($scope, $events, Food) {
			$scope.admin.active = 'food';
			$scope.food = {
				name: '',
				price: '',
				unit: '',
				keywords: '',
				qty: 0
			};
			$scope.addFood = function(food) {
				Food.add(food).$promise.then(function(newFood) {
					$scope.food = {
						name: '',
						price: '',
						unit: '',
						keywords: '',
						qty: 0
					};
					$events.$broadcast('bars.food.add', newFood);
				});
			};
		}
	])
;