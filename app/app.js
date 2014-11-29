'use strict';

var BACKEND_URL = "http://localhost:8000";

angular.module('barsApp', [
  'ui.router',
  'ui.bootstrap',
  'angularMoment',

  'bars.auth',
  'bars.main',
  'bars.admin',
  'bars.magicbar',

  'bars.api.bar',
  'bars.api.food',
  'bars.api.user',
  'bars.api.account',
  'bars.api.transaction',
])

.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/avironjone");

        $stateProvider
            .state('index', {
                url: "/",
                template: "<div ui-view><a title='Déconnexion' ng-click='deconnexion()'>Déconnexion</a></div>",
                controller : ['$scope', 'auth.service', function($scope, AuthService) {
                    $scope.deconnexion = function() {
                        AuthService.logout();
                    };
                }]
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
                    user: ['api.models.user', 'auth.service', function(User, AuthService) {
                        if (AuthService.isAuthenticated()) {
                            return User.me();
                        } else {
                            return null;
                        }
                    }],
                    account: ['api.models.account', 'auth.service', function(Account, AuthService) {
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
                        controller: 'main.ctrl.base'
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
                        controller: 'main.ctrl.bar'
                    }
                }
            });
}])

.config(['$httpProvider',
    function ($httpProvider) {
        $httpProvider.interceptors.push('auth.interceptor');
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
