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
                user: ['api.models.user', 'auth.user', function(User, AuthUser) {
                    User.clear();
                    if (AuthUser.isAuthenticated()) {
                        return User.me();
                    } else {
                        return null;
                    }
                }],
                account: ['api.models.account', 'auth.user', 'user', function(Account, AuthUser, user) {
                    if (AuthUser.isAuthenticated()) {
                        return Account.ofUser(user.id);
                    } else {
                        return null;
                    }
                }],
                role: ['api.models.role', 'auth.user', 'user', 'bar', function(Role, AuthUser, user, bar) {
                    if (AuthUser.isAuthenticated()) {
                        return Role.find(user.id, bar.id);
                    } else {
                        return null;
                    }
                }],
                news: ['api.models.news', function(News) {
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
    ['$scope', '$rootScope', '$stateParams', 'auth.user', 'api.models.account', 'api.models.user', 'api.models.role', 'foods', 'bar', 'accounts', 'user', 'account', 'role',
    function($scope, $rootScope, $stateParams, AuthUser, Account, User, Role, foods, bar, accounts, user, account, role) {
        if (account && account.length > 0) {
            account = Account.get(account[0].id);
        } else {
            account = null;
        }

        if (role && role.length > 0) {
            role = role[0];
        } else {
            role = null;
        }

        AuthUser.account = account;
        AuthUser.user = user;
        AuthUser.role = role;

        $scope.user = AuthUser;

        $scope.bar = {
            id: $stateParams.bar,
            name: bar.name,
            accounts: accounts,
            search: '',
            foods: foods,
            active: 'index',
        };
        $scope.login = {
            username: '',
            password: ''
        };

        $scope.connexion = function (login) {
            $scope.loginError = false;
            $scope.inLogin = true;
            AuthUser.login(login).then(
                function(user) {
                    $scope.login = {username: '', password: ''};
                    $scope.inLogin = false;
                }, function(error) {
                    $scope.loginError = true;
                    $scope.login.password = '';
                    $scope.inLogin = false;
                }
            );
        };
    }])

.controller(
    'main.ctrl.bar',
    ['$scope','news', function($scope, news) {
        $scope.bar.active = 'index';
        $scope.last_news = function () {
            return _.sortBy(_.reject(news, 'deleted'), 'last_modified').pop();
        };
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
