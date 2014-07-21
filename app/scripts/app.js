'use strict';


var barsApp = angular.module('bars.app', [
  'ui.router',
  'bars.auth',
  'bars.API',
  'bars.ctrl.main',
  'bars.ctrl.food',
  'bars.ctrl.user',
  'bars.ctrl.history',
  'bars.ctrl.dev',
  'angularMoment'
]);

barsApp.config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise("/");

		$stateProvider
			.state('index', {
				url: "/",
				template: "<div ui-view><a title='Déconnexion' ng-click='deconnexion()'>Déconnexion</a></div>",
				controller : function($scope, AuthService) {
					$scope.deconnexion = function() {
						AuthService.logout();
					};
				}
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
					accounts: ['API.Account', function(Account) {
						return Account.query().$promise;
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
						controller: 'MainBaseCtrl'
					},
					'form@bar': {
						templateUrl: "views/form.html",
						controller: 'MainFormCtrl'
					},
					'header@bar': {
						templateUrl: "views/header.html",
					},
					'@bar': {
    					templateUrl: "views/home.html",
        				controller: 'MainBarCtrl'
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
				resolve:{
					foodDetails: ['API.Food', '$stateParams', function(Food, $stateParams){
						return Food.get({id:$stateParams.id}).$promise;
					}],
					foodHistory: ['API.Transaction', '$stateParams', function(Transaction, $stateParams) {
						return Transaction.byItem({id: $stateParams.id}).$promise;
					}]
				},
				controller: 'FoodDetailCtrl'
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
				controller: 'UserCtrl'
			})
			.state('bar.user.list', {
				url: "/list",
				templateUrl: "views/User/list.html",
				controller: 'UserListCtrl'
			})
			.state('bar.user.detail', {
				url: "/:id",
				templateUrl: "views/User/detail.html",
				resolve:{
					user: ['API.Account', '$stateParams', function(Account, $stateParams) {
						return Account.get({id: $stateParams.id}).$promise;
					}],
					history: ['API.Transaction', '$stateParams', function(Transaction, $stateParams) {
						return Transaction.byAccount({id: $stateParams.id}).$promise;
					}]
				},
				controller: 'UserDetailCtrl'
			})
			.state('bar.history', {
				url: "/history",
				templateUrl: "views/history.html",
				resolve: {
					history: ['API.Transaction', '$stateParams', function(Transaction) {
						return Transaction.query().$promise;
					}]
				},
				controller: 'HistoryCtrl'
			})
			.state('bar.dev', {
				url: "/dev",
				templateUrl: "views/dev.html",
				controller: 'DevCtrl'
			})
}]);

barsApp.config(['$httpProvider',
	function ($httpProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
}]);

barsApp.run(function(amMoment) {
    amMoment.changeLanguage('fr');
});

