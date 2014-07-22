'use strict';

angular.module('bars.ctrl.account', [
    ])
    .controller('AccountDetailCtrl',
        ['$scope', 'account', 'history', function($scope, account, history) {
            $scope.AccountDetail = account;
            $scope.history = history;
        }])
    .controller('AccountsListCtrl',
        ['$scope', 'API.Account', function($scope, Account) {
            $scope.updateAccountsList = function() {
                $scope.updatingAccountsList = true;
                $scope.bar.accounts =  Account.query({}, function () {
                    $scope.updatingAccountsList = false;
                });
            };
        }])
    .controller('AccountCtrl',
        ['$scope', function($scope) {
            $scope.bar.active = 'account';
        }])
;