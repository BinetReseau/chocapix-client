'use strict';

angular.module('bars.ctrl.account', [
    ])
    .controller('AccountDetailCtrl',
        ['$scope', 'account', 'history', 'API.Action', function($scope, account, history, APIAction) {
            $scope.accountDetail = account;
            $scope.history = history;
            $scope.queryType = 'give';
            $scope.query = function(qty, type) {
                if (type == 'give') {
                    APIAction.give({recipient: account.id, qty: qty}).$promise.then(function(transaction) {
                        $scope.$emit('bars_update_account', $scope.user.account.id);
                        $scope.$emit('bars_update_history', transaction.id);
                    });
                }
            }

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
