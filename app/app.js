'use strict';

var BACKEND_URL = "http://nadrieril.fr/bars/api";

angular.module('barsApp', [
  'ui.router',
  'ui.bootstrap',
  'angularMoment',
  'ngAnimate',

  'bars.auth',
  'bars.main',
  'bars.admin',
  'bars.magicbar',
  'bars.meal',

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
            });
}])

.config(['$httpProvider',
    function ($httpProvider) {
        $httpProvider.interceptors.push('auth.interceptor');
}])

.run(function(amMoment) {
    moment.locale('fr', {
        calendar : {
            lastDay : '[Hier]',
            sameDay : "[Aujourd'hui]",
            nextDay : '[Demain]',
            lastWeek : 'dddd [dernier]',
            nextWeek : 'dddd [prochain]',
            sameElse : 'L'
        }
    });
    amMoment.changeLocale('fr');
})
;
