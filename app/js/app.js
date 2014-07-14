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
						controller: ['$scope', '$filter', 'API.Food', function($scope, $filter, Food) {
							$scope.query = {
								type: 'acheter',
								qty: 1,
								unit: null,
								name: ''
							};
							$scope.analyse = function(q) {
								$scope.query = {
									type: 'acheter',
									qty: 1,
									unit: null,
									name: '',
									food: null
								};
								// Type: acheter|jeter|ajouter|appro
								if (/acheter/i.test(q)) {
									$scope.query.type = 'acheter';
									q = q.replace(/acheter/gi, '');
								} else if (/jeter/i.test(q)) {
									$scope.query.type = 'jeter';
									q = q.replace(/jeter/gi, '');
								}

								// Quantity + unit
								if (/([0-9]+(\.[0-9]+)?) *([a-z]{1,2}) /ig.test(q)) {
									$scope.query.qty = q.replace(/^(.*[^0-9.])?([0-9]+(\.[0-9]+)?) *([a-z]{1,2}) .*$/ig, '$2');
									$scope.query.unit = q.replace(/^(.*[^0-9.])?([0-9]+(\.[0-9]+)?) *([a-z]{1,2}) .*$/ig, '$4');
									q = q.replace(/([0-9]+(\.[0-9]+)?) *([a-z]{1,2}) /ig, ' ');
								} else if (/([0-9]+(\.[0-9]+)?) *([a-z]{1,2})$/ig.test(q)) {
									$scope.query.qty = q.replace(/^(.*[^0-9.])?([0-9]+(\.[0-9]+)?) *([a-z]{1,2})$/ig, '$2');
									$scope.query.unit = q.replace(/^(.*[^0-9.])?([0-9]+(\.[0-9]+)?) *([a-z]{1,2})$/ig, '$4');
									q = q.replace(/([0-9]+(\.[0-9]+)?) *([a-z]{1,2})$/ig, '');
								} else { // Quantity without unit
									if (/1664/.test(q)) {
										$scope.query.name = '1664';
										q = q.replace(/1664/g, '');
										$scope.query.qty = q.replace(/^(.*[^0-9.])?([0-9]+(\.[0-9]+)?).*$/, '$1');
									}
									$scope.query.qty = q.replace(/^(.*[^0-9.])?([0-9]+(\.[0-9]+)?).*$/g, '$2').trim();
									if ($scope.query.qty == q.trim()) {
										$scope.query.qty = 1;
									}
									q = q.replace(/([0-9]+(\.[0-9]+)?)/g, '')
								}

								// Aliment
								q = q.replace(/( de )|( d')/gi, '');
								q = q.replace(/ +/g, '');
								q = q.trim();
								if ($scope.query.name == '') {
									$scope.query.name = q;
								}

								var foods = $filter('filter')($scope.bar.foods, $scope.query.name, false);

								if (foods.length == 1) {
									$scope.query.food = foods[0];
									$scope.query.unit = $scope.query.food.unit;
								}

								return $scope.query;
							};
							$scope.executeQuery = function() {
								if ($scope.query.food === null) {
									return null;
								}
								var id = $scope.query.food.id;
								var Transaction = Food.buy({item: id, qty: $scope.query.qty}, function () {
									for (var  i = 0 ; i < Transaction.operations.length ; i++) {
										if (Transaction.operations[i].type == 'stockoperation' && Transaction.operations[i].item.id == id) {
											$scope.FoodDetails = Transaction.operations[i].item;
										} else if (Transaction.operations[i].type == 'accountoperation') {
											$scope.user.account.money = Transaction.operations[i].account.money;
										}
									}
									$scope.bar.search = '';
								});
							};
						}]
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
				resolve:{
					user: ['API.User', '$stateParams', function(User, $stateParams) {
						return User.get({id: $stateParams.id}).$promise;
					}]
				},
				controller: ['$scope', 'user', function($scope, user) {
					$scope.UserDetail = user;
				}]
			})
			.state('bar.history', {
				url: "/history",
				templateUrl: "views/history.html",
				resolve:{
					history: ['API.Transaction', '$stateParams', function(Transaction) {
						return Transaction.query().$promise;
					}]
				},
				controller: ['$scope', 'API.Transaction', 'history', function($scope, Transaction, history) {
					$scope.bar.active = 'history';
					$scope.history = history;
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

