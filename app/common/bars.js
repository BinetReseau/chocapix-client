'use strict';

angular.module('bars.bars', [
    'bars.filters'
    ])

.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/home");

        $stateProvider
            .state('index', {
                url: "/home",
                resolve: {
                    api: ['APIInterface' , function(APIInterface) {
                        APIInterface.setBar('');
                    }],
                    barssettings_list: ['api.models.barsettings', function(BarSettings) {
                        return BarSettings.reload();
                    }],
                    bars_list: ['api.models.bar', function(Bar) {
                        return Bar.reload();
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
                controller: 'bars.ctrl'
            });
}])

.controller('bars.ctrl',
    ['$scope', '$rootScope', 'auth.user', 'bars_list', 'user', 'api.models.user', 'api.models.account', 'api.models.bar', 'accounts',
    function($scope, $rootScope, AuthUser, bars_list, user, User, Account, Bar, accounts) {
        $rootScope.appLoaded = true;

        function upBars() {
            bars_list = _.filter(bars_list, function (b) {
                return b.id != 'root';
            });
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

        $scope.colors = function (t) {
            var out = '';
            for (var i = 0; i < t.length; i++) {
                out += "<span>" + t[i] + "</span>";
            }
            return out;
        }

        AuthUser.user = user;
        $scope.user = AuthUser;
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
            AuthUser.login(login).then(
                function(user) {
                    Account.ofUser(user.id).then(function(accounts) {
                        $scope.accounts = accounts;
                        $scope.totalMoney = _.reduce(accounts, function (sum, o) {
                            return sum + o.money;
                        }, 0);
                    });
                    $scope.login = {username: '', password: ''};
                    $scope.inLogin = false;
                    Bar.reload();
                }, function() {
                    $scope.loginError = true;
                    $scope.login.password = '';
                    $scope.inLogin = false;
                }
            );
        };
    }])
;
