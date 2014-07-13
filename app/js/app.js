'use strict';


var barsApp = angular.module('bars.app', [
  'ui.router',
  'bars.auth',
  'bars.API',
  'bars.filters'
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
					user: ['API.Me', 'AuthService', function(Me, AuthService) {
						if (AuthService.isAuthenticated()) {
							return Me.all().$promise;
						} else {
							return null;
						}
					}],
					account: ['API.Me', 'AuthService', function(Me, AuthService) {
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
						controller: ['$scope', '$stateParams', 'AuthService', 'foods', 'bar', 'users', 'user', 'account', function($scope, $stateParams, AuthService, foods, bar, users, user, account) {
							$scope.bar = {
							    id: $stateParams.bar,
							    name: bar.name,
							    users: users,
							    search: '',
							    foods: foods,
							    active: 'index',
                            };
                            $scope.user = {
                            	infos: user,
                            	isAuthenticated: AuthService.isAuthenticated,
							    logout: AuthService.logout,
                            	account: account
                            }
                            $scope.login = {
                            	login: '',
                            	password: ''
                            };

                            $scope.connexion = function (login) {
                            	$scope.loginError = false;
                            	$scope.inLogin = true;
                                AuthService.login(login).then(
                                	function(user) {
	                            		$scope.user.infos = user;
	                            		$scope.login = {login: '', password: ''};
			                            $scope.inLogin = false;
	                            	}, function() {
	                            		$scope.loginError = true;
	                            		$scope.login.password = '';
	                            		$scope.inLogin = false;
	                            	}
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
				templateUrl: "views/Stock/list.html"
			})
			.state('bar.food.detail', {
				url: "/:id",
				templateUrl: "views/Stock/details.html",
				controller: ['$scope', '$stateParams', 'API.Food', function($scope, $stateParams, Food) {
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
				}]
			})
			.state('bar.food.search', {
				url: "/search/:q",
				templateUrl: "views/Stock/list.html",
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
					$scope.updateUserList = function() {
					    $scope.updatingUserList = true;
    				    $scope.bar.users =  User.query({}, function () {
        				    $scope.updatingUserList = false;
    				    });
					};
				}]
			})
			.state('bar.user.detail', {
				url: "/:id",
				templateUrl: "views/User/detail.html",
				controller: ['$scope', '$stateParams', 'API.User', function($scope, $stateParams, User) {
					$scope.UserDetail = User.get({id: $stateParams.id});
				}]
			})
			.state('bar.history', {
				url: "/history",
				templateUrl: "views/history.html",
				controller: ['$scope', 'API.Transaction', function($scope, Transaction) {
					$scope.bar.active = 'history';
					$scope.history = Transaction.query();
					$scope.updateHistory = function() {
					    $scope.updatingHistory = true;
    				    $scope.history =  Transaction.query({}, function () {
        				    $scope.updatingHistory = false;
    				    });
					};
				}]
			})
}]);

barsApp.config(['$httpProvider',
	function ($httpProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
}]);

