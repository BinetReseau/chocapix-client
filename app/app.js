'use strict';

angular.module('bars.app', [
  'ui.router',
  'ui.bootstrap',
  'angularMoment',

  'bars.auth',
  'bars.ctrl.main',
  'bars.ctrl.admin',
  'bars.magicbar',

  'bars.api.bar',
  'bars.api.food',
  'bars.api.user',
  'bars.api.account',
  'bars.api.transaction',
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
                    }],
                    bar: ['api.models.bar' , '$stateParams', function(Bar, $stateParams) {
                        return Bar.getSync($stateParams.bar);
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
                        templateUrl: "components/magicbar/form.html",
                        controller: 'magicbar.ctrl'
                    },
                    'header@bar': {
                        templateUrl: "common/header.html",
                    },
                    '@bar': {
                        templateUrl: "common/home.html",
                        controller: 'MainBarCtrl'
                    }
                }
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
