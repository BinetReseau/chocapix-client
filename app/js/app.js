'use strict';


var barsApp = angular.module('bars.app', [
  'ui.router',
  'bars.auth',
  'bars.API'
]);

// barsApp.config(['$routeProvider',
//   function($routeProvider) {
// 	$routeProvider.
// 	  when('/', {
// 		templateUrl: 'partials/index.html',
// 		controller: 'IndexCtrl'
// 	  }).
// 	  when('/:bar', {
// 		templateUrl: 'partials/bar.html',
// 		controller: 'BarCtrl'
// 	  }).
// 	  when('/:bar/user', {
// 		templateUrl: 'partials/user.html',
// 		controller: 'UserCtrl'
// 	  }).
// 	  when('/:bar/food/:id', {
// 		templateUrl: 'partials/food.html',
// 		controller: 'FoodCtrl'
// 	  }).
// 	  when('/:bar', {
// 		templateUrl: 'partials/serie.html',
// 		controller: 'SerieCtrl'
// 	  }).
// 	  otherwise({
// 		redirectTo: '/'
// 	  });
//   }]);

barsApp.config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise("/");

		$stateProvider
			.state('index', {
				url: "/",
				template: "<div ui-view>Rien</div>"
			})
			.state('bar', {
				url: "/:bar",
				resolve: {
					api: ['API' , '$stateParams', function(API, $stateParams){
						API.setBarId($stateParams.bar);
						return null;
					}]
				},
				views: {
					'@': {
						templateUrl: "views/bar.html",
						controller: ['$scope', '$stateParams', function($scope, $stateParams) {
							$scope.bar = $stateParams.bar;
							$scope.search = {
    							keyword: ''
							};
						}]
					},
					'form@bar': {
						templateUrl: "views/form.html",
					},
					'header@bar': {
						templateUrl: "views/header.html",
					}
				}
			})

			.state('bar.food', {
				url: "/food",
				abstract: true,
				template:'<ui-view/>'
			})
			.state('bar.food.list', {
				url: "/list",
				templateUrl: "views/foodlist.html",
				resolve: {
					foods: ['API.Food', function(Food){
						return Food.query().$promise;
					}],
				},
				controller: ['$scope', 'foods', function($scope, foods){
					$scope.foods=foods;
				}]
			})
			.state('bar.food.search', {
				url: "/search/:q",
				templateUrl: "views/foodlist.html",
				resolve:{
					foods: ['API.Food', '$stateParams', function(Food, $stateParams){
						return Food.search({q:$stateParams.q}).$promise;
					}]
				},
				controller: function($scope, foods) {
					$scope.foods = foods;
				}
			})

			// .state('state1', {
			// 	url: "/state1",
			// 	templateUrl: "partials/state1.html"
			// })
			// .state('state1.list', {
			// 	url: "/list",
			// 	templateUrl: "partials/state1.list.html",
			// 	controller: function($scope) {
			// 		$scope.items = ["A", "List", "Of", "Items"];
			// 	}
			// })
			// .state('state2', {
			// 	url: "/state2",
			// 	templateUrl: "partials/state2.html"
			// })
			// .state('state2.list', {
			// 	url: "/list",
			// 	templateUrl: "partials/state2.list.html",
			// 	controller: function($scope) {
			// 		$scope.things = ["A", "Set", "Of", "Things"];
			// 	}
			// });
}]);

barsApp.config(['$httpProvider',
	function ($httpProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
}]);

