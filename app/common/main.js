'use strict';

angular.module('bars.main', [
    'bars.filters'
    ])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('bar', {
            url: "/:bar",
            resolve: {
                api: ['APIInterface' , '$stateParams', function(APIInterface, $stateParams) {
                    APIInterface.setBar($stateParams.bar);
                }],
                bar: ['api.models.bar' , '$stateParams', function(Bar, $stateParams) {
                    return Bar.get($stateParams.bar);
                }],
                foods: ['api.models.food', function(Food) {
                    Food.reload();
                    return Food.all();
                }],
                accounts: ['api.models.account', function(Account) {
                    Account.reload();
                    return Account.all();
                }],
                users: ['api.models.user', function(User) {
                    User.reload();
                    return User.all();
                }],
                user: ['api.models.user', 'auth.service', function(User, AuthService) {
                    if (AuthService.isAuthenticated()) {
                        return User.me();
                    } else {
                        return null;
                    }
                }],
                account: ['api.models.account', 'auth.service', function(Account, AuthService) {
                    if (AuthService.isAuthenticated()) {
                        return Account.me();
                    } else {
                        return null;
                    }
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
    ['$scope', '$stateParams', 'auth.service', 'api.models.account', 'api.models.user', 'foods', 'bar', 'accounts', 'user', 'account',
    function($scope, $stateParams, AuthService, Account, User, foods, bar, accounts, user, account) {
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
            logout: AuthService.logout,
            account: account
        };
        $scope.login = {
            password: ''
        };

        $scope.connexion = function (login) {
            $scope.loginError = false;
            $scope.inLogin = true;
            AuthService.login(login).then(
                function(user) {
                    $scope.user.infos = User.me().then(function(user) {
                        $scope.user.infos = user;
                    });
                    $scope.user.account = Account.me().then(function(account) {
                        $scope.user.account = account;
                    });
                    $scope.login = {password: ''};
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
    ['$scope', function($scope) {
        $scope.bar.active = 'index';
        document.getElementById("q_alim").focus();
    }])
;
