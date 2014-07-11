'use strict';


var barsApp = angular.module('bars.app', [
  'ui.router',
  'bars.auth',
  'bars.API'
]);

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
					api: ['API' , '$stateParams', function(API, $stateParams) {
						API.setBarId($stateParams.bar);
						return null;
					}],
					bar: ['API.Bar' , '$stateParams', function(Bar, $stateParams) {
						return Bar.get().$promise;
					}],
					foods: ['API.Food', function(Food) {
						return Food.query().$promise;
					}],
					users: ['API.User', function(User) {
						return User.query().$promise;
					}]
				},
				views: {
					'@': {
						templateUrl: "views/bar.html",
						controller: ['$scope', '$stateParams', 'AuthService', 'foods', 'bar', 'users', function($scope, $stateParams, AuthService, foods, bar, users) {
							$scope.bar = {
							    id: $stateParams.bar,
							    name: bar.name,
							    users: users,
							    search: '',
							    foods: foods,
							    active: 'index',
							    isAuthenticated: AuthService.isAuthenticated()
                            };
                            $scope.connexion = function (login, mdp) {
                                return AuthService.login({
                                    login: login,
                                    password: mdp
                                });
                            };
						}]
					},
					'form@bar': {
						templateUrl: "views/form.html",
					},
					'header@bar': {
						templateUrl: "views/header.html",
					},
					'@bar': {
    					templateUrl: "views/home.html",
        				controller: ['$scope', function($scope) {
        					$scope.bar.active = 'index';
        				}]
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
				templateUrl: "views/foodlist.html"
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
			.state('bar.user', {
				url: "/user",
				abstract: true,
				template:'<ui-view/>',
				controller: ['$scope', function($scope) {
					$scope.bar.active = 'user';
				}]
			})
			.state('bar.user.list', {
				url: "/list",
				templateUrl: "views/User/list.html"
			})
}]);

barsApp.config(['$httpProvider',
	function ($httpProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
}]);

