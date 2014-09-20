'use strict';


angular.module('bars.app', [
  'ui.router',
  'ui.bootstrap',
  'angularMoment',

  'bars.auth',
  'bars.ctrl.main',
  'bars.ctrl.admin',

  'bars.api.bar',
  'bars.api.food',
  'bars.api.user',
  'bars.api.account',
  'bars.api.transaction',
  'bars.ctrl.history',
])

.config(['$stateProvider', '$urlRouterProvider',
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
                    api: ['APIInterface' , '$stateParams', function(APIInterface, $stateParams) {
                        APIInterface.setBar($stateParams.bar);
                        return null;
                    }],
                    bar: ['api.models.bar' , '$stateParams', function(Bar, $stateParams) {
                        return Bar.get($stateParams.bar);
                    }],
                    foods: ['api.models.food', function(Food) {
                        return Food.all();
                    }],
                    accounts: ['api.models.account', function(Account) {
                        return Account.all();
                    }],
                    user: ['api.models.user', 'AuthService', function(User, AuthService) {
                        if (AuthService.isAuthenticated()) {
                            return User.me();
                        } else {
                            return null;
                        }
                    }],
                    account: ['api.models.account', 'AuthService', function(Account, AuthService) {
                        if (AuthService.isAuthenticated()) {
                            return Account.me();
                        } else {
                            return null;
                        }
                    }]
                },
                views: {
                    '@': {
                        templateUrl: "common/bar.html",
                        controller: 'MainBaseCtrl'
                    },
                    'form@bar': {
                        templateUrl: "common/form.html",
                        controller: 'MainFormCtrl'
                    },
                    'header@bar': {
                        templateUrl: "common/header.html",
                    },
                    '@bar': {
                        templateUrl: "common/home.html",
                        controller: 'MainBarCtrl'
                    }
                }
            })

            .state('bar.history', {
                url: "/history",
                templateUrl: "components/API/history/history.html",
                resolve: {
                    history: ['api.models.transaction', '$stateParams', function(Transaction) {
                        return Transaction.all();
                    }]
                },
                controller: 'HistoryCtrl'
            })
            .state('bar.admin', {
                url: "/admin",
                views: {
                    '@bar': {
                        templateUrl: "components/admin/layout.html",
                        controller: 'AdminBaseCtrl'
                    },
                    '@bar.admin': {
                        templateUrl: "components/admin/dashboard.html",
                        controller: 'AdminHomeCtrl'
                    }
                }
            })
            .state('bar.admin.food', {
                url: "/food",
                templateUrl: "components/admin/Food/home.html",
                controller: 'AdminFoodCtrl'
            });
}])

.config(['$httpProvider',
    function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
}])

.run(function(amMoment) {
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
})
;
