'use strict';


var barsApp = angular.module('bars.app', [
  'ui.router',
  'bars.auth',
  'bars.API',
  'bars.ctrl.main',
  'bars.ctrl.food',
  'bars.ctrl.account',
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
						return Transaction.byAccount({id: $stateParams.id}).$promise;
					}]
				},
				controller: 'AccountDetailCtrl'
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

barsApp.directive('barsFood', function() {
    return {
        restrict: 'E',
        scope: {
            food: '=food',
            unit: '=unit',
            qty: '=qty'
        },
        template: function(elt, attrs) {
            if(attrs.unit === undefined || attrs.qty === undefined) {
                return '<a title="Voir la fiche de cet aliment" ui-sref="bar.food.detail({ bar: food.bar, id:food.id })">' +
                        '{{ food.name }}' +
                    '</a>';
            } else {
                return '{{ qty | number }} ' +
                        '<span ng-if="unit != \'\'">{{ unit }} {{ food.name | affd }}</span>' +
                        '<a title="Voir la fiche de cet aliment" ui-sref="bar.food.detail({ bar: food.bar, id:food.id })">' +
                            '<span ng-if="unit != \'\'">{{ food.name }}</span>' +
                            '<span ng-if="unit == \'\'">{{ food.name | affs:qty }}</span>' +
                        '</a>';
            }
        }
    };
});
barsApp.directive('barsAccount', function() {
    return {
        restrict: 'E',
        scope: {
            account: '=account'
        },
        template: '<a title="En savoir plus sur {{ account.user.name }}" ui-sref="bar.account.detail({ bar: account.bar, id:account.id })">' +
                    '{{ account.user.name }}' +
                '</a>'
    };
});




barsApp.run(function(amMoment) {
	amMoment.changeLanguage('fr');
});

