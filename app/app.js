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
  'bars.storage',
  'bars.main',
  'bars.admin',
  'bars.magicbar',
  'bars.meal',
  'bars.settings',
  'bars.stats',
  'bars.ranking',
  'bars.sugive',

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
  'bars.api.bug',
  'bars.api.menu',
  'bars.api.suggesteditem',
])

.config(['APIURLProvider', 'OFFURLProvider', function(APIURL, OFFURL) {
    //Defined in app/config.js
    APIURL.url = API_URL;
    OFFURL.url = OFF_URL;
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
    ['$scope', '$http', '$interval',
    function ($scope, $http, $interval) {
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
        }
        $interval(checkVersion, 60000);
    }])
.controller('index.splash',
    ['$rootScope', '$scope', '$timeout',
    function ($rootScope, $scope, $timeout) {
        $scope.percent = 0;
        var step = 100/9;
        $rootScope.$watch('appLoaded', function () {
            if ($rootScope.appLoaded) {
                $scope.appLoaded = true;
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
        $rootScope.$on('api.News.error', function () {
            $scope.percent += step;
            $scope.mleft = "News : erreur";
        });
        $rootScope.$on('api.SuggestedItem.loaded', function () {
            $scope.percent += step;
            $scope.mleft = "SuggestedItem";
        });
        $rootScope.$on('api.SuggestedItem.error', function () {
            $scope.percent += step;
            $scope.mleft = "SuggestedItem : erreur";
        });
    }])
;
