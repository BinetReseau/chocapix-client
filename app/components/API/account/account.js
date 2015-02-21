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
                            return _.deburr(this.owner.full_name.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1 ||
                                _.deburr(this.owner.pseudo.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1;
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
        $scope.account_list = _.filter(account_list, function(a) { var u = a.owner; return u.full_name != 'Bar' || u.username != 'bar'; });
        $scope.list_order = 'owner.full_name';
        $scope.reverse = false;
        $scope.searchl = "";
        $scope.filterAccounts = function(o) {
            return o.filter($scope.searchl);
        };
        $scope.filterHidden = function() {
            if ($scope.showHidden) {
                return '';
            } else {
                return {
                    deleted: false
                };
            }
        };
    }])
.controller('api.ctrl.account_detail',
    ['$scope', 'account', 'api.services.action', 'api.models.user', 
    function($scope, account, APIAction, User) {
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
        $scope.pwdSuccess = 0;
        $scope.jaiCompris = false;
        $scope.resetPwd = function() {
            // [TODO]
        };
        $scope.toggleDeleted = function() {
            $scope.account.deleted = !$scope.account.deleted;
            $scope.account.$save();
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
