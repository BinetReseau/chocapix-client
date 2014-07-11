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
					}],
					me: ['API.Me', 'AuthService', function(Me, AuthService) {
						if (AuthService.isAuthenticated()) {
							return Me.get().$promise;
						} else {
							return null;
						}
					}]
				},
				views: {
					'@': {
						templateUrl: "views/bar.html",
						controller: ['$scope', '$stateParams', 'AuthService', 'foods', 'bar', 'users', 'me', function($scope, $stateParams, AuthService, foods, bar, users, me) {
							$scope.bar = {
							    id: $stateParams.bar,
							    name: bar.name,
							    users: users,
							    search: '',
							    foods: foods,
							    active: 'index',
							    isAuthenticated: AuthService.isAuthenticated,
							    logout: AuthService.logout
                            };
                            $scope.user = me;
                            $scope.login = {
                            	login: '',
                            	password: ''
                            };

                            // For connexion:
                            var resultLogin = {
                            	ok: function(user) {
                            		$scope.user = user;
                            		$scope.login = {
		                            	login: '',
		                            	password: ''
		                            };
		                            $scope.inLogin = false;
                            	},
                            	error: function() {
                            		$scope.loginError = true;
                            		$scope.inLogin = false;
                            		$scope.login.password = '';
                            	}
                            };
                            $scope.connexion = function (login) {
                            	$scope.loginError = false;
                            	$scope.inLogin = true;
                                AuthService.login(
                                	login,
                                	resultLogin
                                );
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
				templateUrl: "views/User/list.html",
				controller: ['$scope', 'API.User', function($scope, User) {
					$scope.bar.active = 'user';
					$scope.updateUserList = function() {
					    $scope.updatingUserList = true;
    				    $scope.bar.users =  User.query({}, function () {
        				    $scope.updatingUserList = false;
    				    });
					};
				}]
			})
}]);

barsApp.config(['$httpProvider',
	function ($httpProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
}]);

