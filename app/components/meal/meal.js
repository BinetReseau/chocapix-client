'use strict';

angular.module('bars.meal', [
    //
])

.controller('meal.ctrl',
    ['$scope', 'api.models.food', 'api.models.account', 'api.services.action', '$filter', 
    function($scope, Food, Account, APIAction, $filter) {
        $scope.customersList = [ { account: $scope.user.account, ratio: 1, amount: 0 } ];
        $scope.itemsList = [];
        $scope.totalPrice = 0;
        /////////////////////
        // calcul des prix payés par chacun
        /////////////////////
        function array_sum(tab) { // somme des éléments d'un tableau
            var somme = 0;
            for (var i = 0; i < tab.length; i++) {
                somme += tab[i];
            }
            return somme;
        }
        $scope.amountCompute = function() {
            var nbParts = 0; // nombre de parts pour le calcul (somme des ratios)
            angular.forEach($scope.customersList, function(customer) {
                nbParts += customer.ratio;
            });
            var nbCustomers = $scope.customersList.length;
            var nbItems = $scope.itemsList.length;
            var itemsPrices = [];
            angular.forEach($scope.itemsList, function(item, i) {
                itemsPrices[i] = item.item.price * item.qty;
            });
            var totalPrice = 0;
            angular.forEach($scope.customersList, function(customer) {
                customer.amount = array_sum(itemsPrices) * customer.ratio / nbParts;
                totalPrice += customer.amount;
            });
            $scope.totalPrice = totalPrice;
        }

        $scope.addCustomer = function(item, model, label) {
            if ($filter('filter')($scope.customersList, function(value, index) { return value.account.id == item.id; }).length == 0) {
                $scope.customersList[$scope.customersList.length] = { account: item, ratio: 1, amount: 0 };
                $scope.accountToAdd = '';
            }
            $scope.amountCompute();
        };
        $scope.removeCustomer = function(cstmr) {
            $scope.customersList.splice($scope.customersList.indexOf(cstmr), 1);
            $scope.amountCompute();
        };
        $scope.addItem = function(item, model, label) {
            if ($filter('filter')($scope.itemsList, function(value, index) { return value.item.id == item.id; }).length == 0) {
                $scope.itemsList[$scope.itemsList.length] = { item: item, qty: 1 };
                console.log(item);
                $scope.itemToAdd = '';
            } 
            $scope.amountCompute();
        };
        $scope.removeItem = function(item) {
            $scope.itemsList.splice($scope.itemsList.indexOf(item), 1);
            $scope.amountCompute();
        };
    }]
)
;