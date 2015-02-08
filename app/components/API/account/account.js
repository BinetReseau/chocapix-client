'use strict';

angular.module('bars.api.account', [
    'APIModel'
    ])

.factory('api.models.account', ['APIModel', 'APIInterface',
    function(APIModel, APIInterface) {
        var model = new APIModel({
                url: 'account',
                type: "Account",
                structure: {
                    'bar': 'Bar',
                    'owner': 'User'
                },
                methods: {
                    'filter': function(s) {
                        if(!this.owner.full_name) {
                            return false;
                        } else {
                            return this.owner.full_name.toLocaleLowerCase().indexOf(s) > -1 ||
                                this.owner.pseudo.toLocaleLowerCase().indexOf(s) > -1;
                        }
                    }
                }
            });
        model.ofUser = function(user) {
            return APIInterface.request({
                'url': 'account',
                'method': 'GET',
                'params': {owner: user}});
        };

        return model;
    }])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('bar.account', {
            url: "/account",
            abstract: true,
            template:'<ui-view/>',
            controller: 'api.ctrl.account'
        })
        .state('bar.account.list', {
            url: "/list",
            templateUrl: "components/API/account/list.html",
            controller: 'api.ctrl.account_list',
            resolve: {
                account_list: ['api.models.account', function(Account) {
                    return Account.all();
                }]
            }
        })
        .state('bar.account.details', {
            url: "/:id",
            templateUrl: "components/API/account/details.html",
            controller: 'api.ctrl.account_detail',
            resolve:{
                account: ['api.models.account', '$stateParams', function(Account, $stateParams) {
                    return Account.getSync($stateParams.id);
                }],
                user_list: ['api.models.user', function(User) {
                    return User.all();
                }]
            }
        });
}])

.controller('api.ctrl.account',
    ['$scope', function($scope) {
        $scope.bar.active = 'account';
    }])
.controller('api.ctrl.account_list',
    ['$scope', 'account_list', function($scope, account_list) {
        $scope.account_list = account_list;
        $scope.list_order = 'owner.full_name';
        $scope.reverse = false;
        $scope.searchl = "";
        $scope.filterAccounts = function(o) {
            return o.filter($scope.searchl);
        };
    }])
.controller('api.ctrl.account_detail',
    ['$scope', 'account', 'api.services.action', 'api.models.user', 'user_list',
    function($scope, account, APIAction, User, user_list) {
        $scope.account = account;
        $scope.query_type = 'give';
        $scope.query_motive = '';
        $scope.query_qty = '';
        $scope.query = function(qty, type, motive) {
            if (type == 'give') {
                APIAction.give({account: account.id, amount: qty}).then(function() {
                    $scope.query_qty = '';
                });
            }
            if (type == 'deposit') {
                APIAction.deposit({account: account.id, amount: qty}).then(function() {
                    $scope.query_qty = '';
                });
            }
            if (type == 'punish') {
                APIAction.punish({account: account.id, amount: qty, motive: motive}).then(function() {
                    $scope.query_qty = '';
                    $scope.query_motive = '';
                });
            }
        };
        // Onglet "Modifier"
        $scope.account.owner.nusername = '';
        $scope.newPwd = null;
        $scope.newPwdBis = null;
        $scope.usernameSuccess = 0;
        $scope.pwdSuccess = 0;
        $scope.checkUsername = function() {
            return _.filter(user_list, {username: $scope.account.owner.nusername}).length == 0;
        };
        $scope.changeUsername = function() {
            if (_.filter(user_list, {username: $scope.account.owner.nusername}).length == 0) {
                var oldUsername = $scope.account.owner.username;
                $scope.account.owner.username = $scope.account.owner.nusername;
                delete $scope.account.owner.nusername;
                $scope.account.owner.$save().then(function(u) {
                    $scope.usernameSuccess = 1;
                    $scope.account.owner.nusername = '';
                }, function(errors) {
                    $scope.account.owner.username = oldUsername;
                    $scope.usernameSuccess = -1;
                    $scope.account.owner.nusername = '';
                    console.log("Changement de username échoué.");
                });
            }
        };
        $scope.changePwd = function() {
            // [TODO] Vérifier le mot de passe actuel via le serveur. Droits pour modifier un mot de passe ?
            // if ($scope.newPwd == $scope.newPwdBis) {
            //     $scope.account.owner.password = $scope.newPwd;
            //     $scope.account.owner.$save().then(function() {
            //         $scope.pwdSuccess = 1;
            //     }, function() {
            //         $scope.newPwd = '';
            //         $scope.newPwdBis = '';
            //         $scope.pwdSuccess = -1;
            //     });
            // } else {
            //     $scope.pwdSuccess = -1;
            //     console.log('Mots de passe différents.');
            // }
        };
    }])

.directive('barsAccount', function() {
    return {
        restrict: 'E',
        scope: {
            account: '=account'
        },
        templateUrl: 'components/API/account/directive.html'
    };
})
;
