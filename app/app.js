'use strict';

angular.module('barsApp', [
  'ui.router',
  'ui.bootstrap',
  'infinite-scroll',
  'angularMoment',
  'ngAnimate',
  'ngSanitize',
  'ui.bootstrap.datetimepicker',
  'angular-loading-bar',

  'bars.auth',
  'bars.root',
  'bars.granking',
  'bars.bars',
  'bars.main',
  'bars.admin',
  'bars.magicbar',
  'bars.meal',
  'bars.settings',
  'bars.stats',
  'bars.ranking',

  'APIModel',
  'OpenFoodFacts',
  'bars.api.bar',
  'bars.api.barsettings',
  'bars.api.food',
  'bars.api.user',
  'bars.api.account',
  'bars.api.transaction',
  'bars.api.news',
  'bars.api.role',
  'bars.api.bug'
])

.config(['APIURLProvider', 'OFFURLProvider', function(APIURL, OFFURL) {
    APIURL.url = "http://bars.nadrieril.fr/api";
    OFFURL.url = "http://bars.nadrieril.fr/off";
    // APIURL.url = "http://127.0.0.1:8000";
    // OFFURL.url = "http://fr.openfoodfacts.org/api/v0/produit";
    // APIURL.url = "http://chocapix/api";
    // OFFURL.url = "http://chocapix/off";

}])

.config(['$httpProvider', '$compileProvider', '$tooltipProvider',
    function ($httpProvider, $compileProvider, $tooltipProvider) {
        $httpProvider.interceptors.push('auth.interceptor');
        $compileProvider.debugInfoEnabled(false);
        $tooltipProvider.setTriggers({'open': 'close'});
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
.controller('index.splash',
    ['$rootScope', '$scope', '$timeout',
    function ($rootScope, $scope, $timeout) {
        $scope.percent = 0;
        var step = 100/8;
        $rootScope.$watch('appLoaded', function () {
            if ($scope.appLoaded) {
                $scope.percent = 100;
            }
        });
        $rootScope.$on('api.ItemDetails.loaded', function () {
            $scope.percent += step;
            $scope.mleft = "ItemDetails";
        });
        $rootScope.$on('api.StockItem.loaded', function () {
            $scope.percent += step;
            $scope.mleft = "StockItem";
        });
        $rootScope.$on('api.SellItem.loaded', function () {
            $scope.percent += step;
            $scope.mleft = "SellItem";
        });
        $rootScope.$on('api.BuyItem.loaded', function () {
            $scope.percent += step;
            $scope.mleft = "BuyItem";
        });
        $rootScope.$on('api.BuyItemPrice.loaded', function () {
            $scope.percent += step;
            $scope.mleft = "BuyItemPrice";
        });
        $rootScope.$on('api.User.loaded', function () {
            $scope.percent += step;
            $scope.mleft = "User";
        });
        $rootScope.$on('api.User.error', function () {
            $scope.percent += step;
            $scope.mleft = "User : erreur";
        });
        $rootScope.$on('api.Account.loaded', function () {
            $scope.percent += step;
            $scope.mleft = "Account";
        });
        $rootScope.$on('api.News.loaded', function () {
            $scope.percent += step;
            $scope.mleft = "News";
        });
    }])
;
