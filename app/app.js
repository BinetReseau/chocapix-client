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
  'bars.api.role'
])

.config(['APIURLProvider', 'OFFURLProvider', function(APIURL, OFFURL) {
    APIURL.url = "http://bars.nadrieril.fr/api";
    OFFURL.url = "http://bars.nadrieril.fr/off";
    // APIURL.url = "http://127.0.0.1:8000";
    // OFFURL.url = "http://fr.openfoodfacts.org/api/v0/produit";
    // OFFURL.url = "http://x.ntag.fr/off.php?c=";
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

        $(document).keyup(function(e) {
            if (e.keyCode == 27) {
                AuthUser.logout();
                $rootScope.$apply();
            }
        });
}])
;
