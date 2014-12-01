'use strict';

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

  'APIModel',
  'bars.api.bar',
  'bars.api.food',
  'bars.api.user',
  'bars.api.account',
  'bars.api.transaction'
])

.config(['APIURLProvider', function(APIURL) {
    APIURL.url = "http://nadrieril.fr/bars/api";
    // APIURL.url = "http://127.0.0.1:8000";
}])

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
