'use strict';

angular.module('bars.main', [
    'bars.filters'
    ])
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
                        });
                        $scope.user.account = Account.me().then(function(account) {
                            $scope.user.account = account;
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
        ['$scope', function($scope) {
            $scope.bar.active = 'index';
            document.getElementById("queryf").focus();
        }])
;
