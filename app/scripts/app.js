'use strict';


var barsApp = angular.module('bars.app', [
  'ui.router',
  'ui.bootstrap',
  'bars.auth',
  'bars.API',
  'bars.events',
  'bars.ctrl.main',
  'bars.ctrl.food',
  'bars.ctrl.account',
  'bars.ctrl.history',
  'bars.ctrl.dev',
  'bars.ctrl.admin',
  'bars.directives',
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
					}],
					$events: ['$events', function($events){
						$events.addEventTransformer('bars.transaction.new', 'bars.transaction.add');
						$events.addEventTransformer('bars.transaction.add', 'bars.transaction.operations.update');
						$events.addEventTransformer('bars.transaction.update', 'bars.transaction.operations.update');
						$events.addEventTransformer('bars.transaction.operations.update', function(transaction){
							var evts = [], o;
							for (var i = 0; i < transaction.operations.length; i++) {
								o = transaction.operations[i];
								if(o.type == 'stockoperation') {
									evts.push({evt: 'bars.food.update', arg: o.item});
								} else if(o.type == 'accountoperation') {
									evts.push({evt: 'bars.account.update', arg: o.account});
								}
							};
							return evts;
						});
						return $events;
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
				template:'<ui-view/>',
				controller: 'FoodCtrl'
			})
			.state('bar.food.list', {
				url: "/list",
				templateUrl: "views/Food/list.html",
				controller: 'FoodListCtrl'
			})
			.state('bar.food.detail', {
				url: "/:id",
				templateUrl: "views/Food/details.html",
				resolve:{
					foodDetails: ['API.Food', '$stateParams', function(Food, $stateParams){
						return Food.get({id:$stateParams.id}).$promise;
					}],
					foodHistory: ['API.Transaction', '$stateParams', function(Transaction, $stateParams) {
						return Transaction.byItem({id: $stateParams.id});
					}]
				},
				controller: 'FoodDetailCtrl'
			})

			.state('bar.account', {
				url: "/account",
				abstract: true,
				template:'<ui-view/>',
				controller: 'AccountCtrl'
			})
			.state('bar.account.list', {
				url: "/list",
				templateUrl: "views/Account/list.html",
				controller: 'AccountsListCtrl'
			})
			.state('bar.account.detail', {
				url: "/:id",
				templateUrl: "views/Account/detail.html",
				resolve:{
					account: ['API.Account', '$stateParams', function(Account, $stateParams) {
						return Account.get({id: $stateParams.id}).$promise;
					}],
					history: ['API.Transaction', '$stateParams', function(Transaction, $stateParams) {
						return Transaction.byAccount({id: $stateParams.id});
					}]
				},
				controller: 'AccountDetailCtrl'
			})

			.state('bar.history', {
				url: "/history",
				templateUrl: "views/history.html",
				resolve: {
					history: ['API.Transaction', '$stateParams', function(Transaction) {
						return Transaction.query();
					}]
				},
				controller: 'HistoryCtrl'
			})
			.state('bar.dev', {
				url: "/dev",
				templateUrl: "views/dev.html",
				controller: 'DevCtrl'
			})
			.state('bar.admin', {
				url: "/admin",
				templateUrl: "views/admin/home.html",
				controller: 'AdminHomeCtrl'
			})
}]);

barsApp.config(['$httpProvider',
	function ($httpProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
}]);

barsApp.run(function(amMoment) {
	moment.lang('fr', {
	    calendar : {
	        lastDay : '[Hier]',
	        sameDay : "[Aujourd'hui]",
	        nextDay : '[Demain]',
	        lastWeek : 'dddd [dernier]',
	        nextWeek : 'dddd [prochain]',
	        sameElse : 'L'
	    }
	});
	amMoment.changeLanguage('fr');
});

// barsApp.run(['APIObject',function(APIObject){
// 	APIObject("", {}, {});
// }])
