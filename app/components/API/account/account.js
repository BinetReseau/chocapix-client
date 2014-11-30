'use strict';

angular.module('bars.api.account', [
    'APIModel'
    ])

.factory('api.models.account', ['APIModel',
    function(APIModel) {
        return new APIModel({
                url: 'account',
                type: "Account",
                structure: {
                    'bar': 'Bar',
                    'owner': 'User'
                },
                methods: {
                    'me': {url: 'me', static: true},
                    'filter': function(s) {
                        if(!this.owner.full_name) {
                            return false;
                        } else {
                            return this.owner.full_name.toLocaleLowerCase().indexOf(s) > -1;
                        }
                    }
                }
            });
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
                account_list: ['api.models.account', function(Account){
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
                account_history: ['api.models.transaction', '$stateParams', function(Transaction, $stateParams) {
                    // TODO: return Transaction.byItem({id: $stateParams.id});
                    Transaction.reload();
                    return Transaction.all();
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
    }])
.controller('api.ctrl.account_detail',
    ['$scope', 'account', 'account_history', 'api.services.action',
    function($scope, account, account_history, APIAction) {
        $scope.account = account;
        $scope.account_history = account_history;
        $scope.query_type = 'give';
        $scope.query_motive = '';
        $scope.query_qty = '';
        $scope.query = function(qty, type, motive) {
            if (type == 'give') {
                APIAction.give({account: account.id, amount: qty}).then(function() {
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
