'use strict';

angular.module('bars.ctrl.account', [
    ])
    .controller('AccountDetailCtrl',
        ['$scope', 'account', 'history', 'API.Action',
        function($scope, account, history, APIAction) {
            $scope.accountDetail = account;
            $scope.history = history;
            $scope.queryType = 'give';
            $scope.queryMotive = '';
            $scope.queryQty = '';
            $scope.query = function(qty, type, motive) {
                if (type == 'give') {
                    APIAction.give({account: account.id, amount: qty}).then(function() {
                        $scope.queryQty = '';
                    });
                }
                if (type == 'punish') {
                    APIAction.punish({account: account.id, amount: qty, motive: motive}).then(function() {
                        $scope.queryQty = '';
                        $scope.queryMotive = '';
                    });
                }
            };
        }])
    .controller('AccountsListCtrl',
        ['$scope', 'API.Account', function($scope, Account) {
            $scope.updateAccountsList = function() {
                $scope.updatingAccountsList = true;
                $scope.bar.accounts.$reload().then(function() {
                    $scope.updatingAccountsList = false;
                });
            };
            $scope.orderList = 'user.name';
            $scope.reverse = false;
        }])
    .controller('AccountCtrl',
        ['$scope', function($scope) {
            $scope.bar.active = 'account';
        }])
;
