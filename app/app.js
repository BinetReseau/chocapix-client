'use strict';


var barsApp = angular.module('bars.app', [
  'ui.router',
  'ui.bootstrap',
  'bars.auth',
  'bars.API',
  'bars.ctrl.main',
  'bars.ctrl.food',
  'bars.ctrl.account',
  'bars.ctrl.history',
  'bars.ctrl.admin',
  'angularMoment',
  // 'APIModel'
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
                        return Bar.get($stateParams.bar);
                    }],
                    foods: ['API.Food', function(Food) {
                        return Food.all();
                    }],
                    accounts: ['API.Account', function(Account) {
                        return Account.all();
                    }],
                    user: ['API.User', 'AuthService', function(User, AuthService) {
                        if (AuthService.isAuthenticated()) {
                            return User.me();
                        } else {
                            return null;
                        }
                    }],
                    account: ['API.Account', 'AuthService', function(Account, AuthService) {
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

            .state('bar.food', {
                url: "/food",
                abstract: true,
                template:'<ui-view/>',
                controller: 'FoodCtrl'
            })
            .state('bar.food.list', {
                url: "/list",
                templateUrl: "components/API/food/list.html",
                controller: 'FoodListCtrl'
            })
            .state('bar.food.detail', {
                url: "/:id",
                templateUrl: "components/API/food/details.html",
                resolve:{
                    foodDetails: ['API.Food', '$stateParams', function(Food, $stateParams){
                        return Food.getSync($stateParams.id);
                    }],
                    foodHistory: ['API.Transaction', '$stateParams', function(Transaction, $stateParams) {
                        // return Transaction.byItem({id: $stateParams.id});
                        return Transaction.all();
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
                templateUrl: "components/API/account/list.html",
                controller: 'AccountsListCtrl'
            })
            .state('bar.account.detail', {
                url: "/:id",
                templateUrl: "components/API/account/detail.html",
                resolve:{
                    account: ['API.Account', '$stateParams', function(Account, $stateParams) {
                        return Account.getSync($stateParams.id);
                    }],
                    history: ['API.Transaction', '$stateParams', function(Transaction, $stateParams) {
                        return Transaction.all();
                    }]
                },
                controller: 'AccountDetailCtrl'
            })

            .state('bar.history', {
                url: "/history",
                templateUrl: "components/API/history/history.html",
                resolve: {
                    history: ['API.Transaction', '$stateParams', function(Transaction) {
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

// barsApp.run(['API.Bar', function(Bar){
//     console.log(Bar.get("avironjone"));
// }]);
