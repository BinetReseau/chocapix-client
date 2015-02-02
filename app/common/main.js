'use strict';

angular.module('bars.main', [
    'bars.filters'
    ])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('bar', {
            url: "/{bar:[^/]+}",
            resolve: {
                api: ['APIInterface' , '$stateParams', function(APIInterface, $stateParams) {
                    APIInterface.setBar($stateParams.bar);
                }],
                bar: ['api.models.bar' , '$stateParams', function(Bar, $stateParams) {
                    return Bar.get($stateParams.bar);
                }],
                foods: ['api.models.food', function(Food) {
                    Food.clear();
                    Food.reload();
                    return Food.all();
                }],
                accounts: ['api.models.account', function(Account) {
                    Account.clear();
                    Account.reload();
                    return Account.all();
                }],
                users: ['api.models.user', function(User) {
                    User.clear();
                    User.reload();
                    return User.all();
                }],
                user: ['api.models.user', 'auth.service', function(User, AuthService) {
                    User.clear();
                    if (AuthService.isAuthenticated()) {
                        return User.me();
                    } else {
                        return null;
                    }
                }],
                account: ['api.models.account', 'auth.service', 'user', function(Account, AuthService, user) {
                    if (AuthService.isAuthenticated()) {
                        return Account.ofUser(user.id);
                    } else {
                        return null;
                    }
                }],
                history: ['api.models.transaction', function(Transaction) {
                    // Transaction.reload();
                    // return Transaction.all();
                }],
                last_news: ['api.models.news', '$filter', function(News, $filter) {
                    News.clear();
                    News.reload();
                    return News.all();
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
                'meal@bar': {
                    templateUrl: "components/meal/panel.html",
                    controller: 'meal.ctrl'
                },
                '@bar': {
                    templateUrl: "common/home.html",
                    controller: 'main.ctrl.bar'
                }
            }
        });
}])

.controller('main.ctrl.base',
    ['$scope', '$rootScope', '$stateParams', 'auth.service', 'api.models.account', 'api.models.user', 'foods', 'bar', 'accounts', 'user', 'account',
    function($scope, $rootScope, $stateParams, AuthService, Account, User, foods, bar, accounts, user, account) {
        if (account && account.length > 0) {
            account = account[0];
        } else {
            account = null;
        }

        $scope.bar = {
            id: $stateParams.bar,
            name: bar.name,
            accounts: accounts,
            search: '',
            foods: foods,
            active: 'index',
        };
        $scope.user = {
            infos: user,
            isAuthenticated: AuthService.isAuthenticated,
            hasAccount: function() {
                return this.account != null;
            },
            logout: AuthService.logout,
            account: account
        };
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
                        $scope.user.account = Account.ofUser(user.id).then(function(account) {
                            if (account && account.length > 0) {
                                account = account[0];
                            } else {
                                account = null;
                            }

                            $scope.user.account = account;
                            $rootScope.$broadcast('auth.hasLoggedIn');
                        }, function (error) {
                            $scope.user.account = null;
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
    }])

.controller(
    'main.ctrl.bar',
    ['$scope','last_news', function($scope, last_news) {
        $scope.bar.active = 'index';
        $scope.last_news = last_news[0]; // il faudrait trier par ordre décroissant de last_modified, retirer les News deleted et prendre le premier élément...
        document.getElementById("q_alim").focus();
    }])

.directive(
    'selectOnClick',
    function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on('click', function () {
                    this.select();
                });
            }
        };
    })
;
