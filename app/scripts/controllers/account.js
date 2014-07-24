'use strict';

angular.module('bars.ctrl.account', [
    ])
    .controller('AccountDetailCtrl',
        ['$scope', 'account', 'history', 'API.Action', '$events',
        function($scope, account, history, APIAction, $events) {
            $scope.accountDetail = account;
            $scope.history = history;
            $scope.queryType = 'give';
            $scope.query = function(qty, type) {
                if (type == 'give') {
                    APIAction.give({recipient: account.id, qty: qty}).$promise.then(function(transaction) {
                        $events.$broadcast('bars.transaction.new', transaction);
                    });
                }
            }

            $scope.$on('bars.account.update', function(evt, account){
                if(account.id == $scope.accountDetail.id) {
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
