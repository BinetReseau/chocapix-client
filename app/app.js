'use strict';

angular.module('barsApp', [
  'ui.router',
  'ui.bootstrap',
  'infinite-scroll',
  'angularMoment',
  'ngAnimate',
  'ngSanitize',

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
  'bars.api.transaction',
  'bars.api.news',
  'bars.api.role'
])

.config(['APIURLProvider', function(APIURL) {
    APIURL.url = "http://bars.nadrieril.fr/api";
    // APIURL.url = "http://127.0.0.1:8000";
}])

.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('index', {
                url: "/",
                resolve: {
                    api: ['APIInterface' , function(APIInterface) {
                        APIInterface.setBar('');
                    }],
                    bars_list: ['api.models.bar', function(Bar) {
                        Bar.reload();
                        return Bar.all();
                    }],
                    user: ['api.models.user', 'auth.service', function(User, AuthService) {
                        if (AuthService.isAuthenticated()) {
                            return User.me();
                        } else {
                            return null;
                        }
                    }],
                    accounts: ['api.models.account', 'auth.service', 'user', function(Account, AuthService, user) {
                        if (AuthService.isAuthenticated()) {
                            return Account.ofUser(user.id);
                        } else {
                            return null;
                        }
                    }]
                },
                templateUrl: "common/bars.html",
                controller : ['$scope', 'auth.service', 'bars_list', 'user', 'api.models.user', 'api.models.account', 'accounts',
                function($scope, AuthService, bars_list, user, User, Account, accounts) {
                    function upBars() {
                        $scope.gbars = [];
                        for (var i = 0; i < bars_list.length; i++) {
                            if (i%3 == 0) {
                                var current = [];
                            }
                            current.push(bars_list[i]);
                            if (i%3==2) {
                                $scope.gbars.push(current);
                            }
                        }
                        if (i%3 != 0) {
                            $scope.gbars.push(current);
                        }
                    };
                    upBars();
                    $scope.$on('api.model.bar.*', upBars);

                    $scope.user = {
                        infos: user,
                        isAuthenticated: AuthService.isAuthenticated,
                        logout: AuthService.logout
                    };
                    $scope.accounts = accounts;
                    $scope.totalMoney = _.reduce(accounts, function (sum, o) {
                        return sum + o.money;
                    }, 0);

                    $scope.login = {
                        username: '',
                        password: ''
                    };
                    $scope.connexion = function (login) {
                        $scope.loginError = false;
                        $scope.inLogin = true;
                        AuthService.login(login).then(
                            function(user) {
                                $scope.user.infos = User.me().then(function(user) {
                                    $scope.user.infos = user;
                                    Account.ofUser(user.id).then(function(accounts) {
                                        $scope.accounts = accounts;
                                        $scope.totalMoney = _.reduce(accounts, function (sum, o) {
                                            return sum + o.money;
                                        }, 0);
                                    });
                                });
                                $scope.login = {username: '', password: ''};
                                $scope.inLogin = false;
                            }, function() {
                                $scope.loginError = true;
                                $scope.login.password = '';
                                $scope.inLogin = false;
                            }
                        );
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
