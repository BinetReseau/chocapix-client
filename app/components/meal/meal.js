'use strict';

angular.module('bars.meal', [
    //
])

.controller('meal.ctrl',
    ['$scope', 'api.models.food', 'api.models.account', 'api.services.action', '$filter', 
    function($scope, Food, Account, APIAction, $filter) {
        $scope.customersList = [ { account: $scope.user.account, ratio: 1, amount: 0 } ];
        $scope.itemsList = [];

        $scope.addCustomer = function(item, model, label) {
            console.log(item);
            if ($filter('filter')($scope.customersList, function(value, index) { return value.account.id == item.id; }).length == 0) {
                $scope.customersList[$scope.customersList.length] = { account: item, ratio: 1 };
                $scope.accountToAdd = '';
            } 
        };
        $scope.removeCustomer = function(cstmr) {
            $scope.customersList.splice($scope.customersList.indexOf(cstmr), 1);
        };
        $scope.addItem = function(item, model, label) {
            if ($filter('filter')($scope.itemsList, function(value, index) { return value.item.id == item.id; }).length == 0) {
                $scope.itemsList[$scope.itemsList.length] = { item: item, qty: 1 };
                console.log(item);
                $scope.itemToAdd = '';
            } 
        }
        $scope.removeItem = function(item) {
            $scope.itemsList.splice($scope.itemsList.indexOf(item), 1);
        };
    }]
)
;