'use strict';

angular.module('barsApp', [
  'ui.router',
  'ui.bootstrap',
  'infinite-scroll',
  'angularMoment',
  'ngAnimate',
  'ngSanitize',
  'ui.bootstrap.datetimepicker',

  'bars.auth',
  'bars.root',
  'bars.main',
  'bars.bars',
  'bars.admin',
  'bars.magicbar',
  'bars.meal',
  'bars.settings',

  'APIModel',
  'OpenFoodFacts',
  'bars.api.bar',
  'bars.api.food',
  'bars.api.user',
  'bars.api.account',
  'bars.api.transaction',
  'bars.api.news',
  'bars.api.role',
  'bars.api.bug'
])

.config(['APIURLProvider', 'OFFURLProvider', function(APIURL, OFFURL) {
    APIURL.url = "http://nadrieril.fr:9000/api";
    OFFURL.url = "http://bars.nadrieril.fr/off";
    // APIURL.url = "http://127.0.0.1:8000";
    // OFFURL.url = "http://fr.openfoodfacts.org/api/v0/produit";
}])

.config(['$httpProvider',
    function ($httpProvider) {
        $httpProvider.interceptors.push('auth.interceptor');
}])

.run(['amMoment', 'auth.user', '$rootScope',
    function(amMoment, AuthUser, $rootScope) {
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

        var last = (new Date()).getTime();
        $(document).keyup(function(e) {
            if (e.keyCode == 27) {
                var current = (new Date()).getTime();
                if (current - last < 300) {
                    AuthUser.logout();
                    $rootScope.$apply();
                }
                last = current;
            }
        });
}])

.controller('index.update',
    ['$scope', '$http', '$timeout',
    function ($scope, $http, $timeout) {
        var version;
        $scope.need_update = false;
        function checkVersion() {
            $http.get('version.json?uniq=' + (new Date()).toJSON()).success(function (v) {
                if (!version) {
                    version = v;
                }
                if (v.build_date != version.build_date) {
                    $scope.need_update = true;
                }
            });
            $timeout(checkVersion, 60000);
        }
        checkVersion();
    }])
;
