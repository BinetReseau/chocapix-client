'use strict';

angular.module('bars.ctrl.account', [
    ])
    .controller('AccountDetailCtrl',
        ['$scope', 'account', 'history', function($scope, account, history) {
            $scope.accountDetail = account;
            $scope.history = history;

            $scope.$on('bars.account.update', function(evt, id){
                if(!id || id == $scope.accountDetail.id) {
                    $scope.accountDetail.$reload();
                }
            });
        }])
    .controller('AccountsListCtrl',
        ['$scope', 'API.Account', function($scope, Account) {
            $scope.updateAccountsList = function() {
                $scope.updatingAccountsList = true;
                $scope.bar.accounts.$reload().$promise.then(function() {
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
