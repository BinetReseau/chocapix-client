'use strict';

angular.module('bars.meal', [
])

.controller('meal.ctrl',
    ['$scope', 'api.models.food', 'api.models.account', 'api.services.action',
    function($scope, Food, Account, APIAction) {
        $scope.customersList = [ { account: $scope.user.account, ratio: 1, amount: 0 } ];
        $scope.itemsList = [];
        $scope.totalPrice = 0;
        $scope.accountToAdd = "";

        $scope.recomputeAmount = function() {
            var nbParts = 0; // nombre de parts pour le calcul (somme des ratios)
            _.forEach($scope.customersList, function(customer) {
                nbParts += customer.ratio;
            });

            var nbCustomers = $scope.customersList.length;
            var nbItems = $scope.itemsList.length;

            var totalPrice = 0;
            _.forEach($scope.itemsList, function(item, i) {
                totalPrice += item.item.price * item.qty;
            });

            _.forEach($scope.customersList, function(customer) {
                customer.amount = totalPrice * customer.ratio / nbParts;
            });
            $scope.totalPrice = totalPrice;
        };

        $scope.addCustomer = function(account, model, label) {
            var other = _.find($scope.customersList, {'account': account});
            if (!other) {
                $scope.customersList.push({ account: account, ratio: 1, amount: 0 });
            }
            $scope.accountToAdd = '';
            $scope.recomputeAmount();
        };
        $scope.removeCustomer = function(cstmr) {
            $scope.customersList.splice($scope.customersList.indexOf(cstmr), 1);
            $scope.recomputeAmount();
        };

        $scope.addItem = function(item, model, label) {
            var other = _.find($scope.itemsList, {'item': item});
            if (other) {
                other.qty += 1;
            } else {
                $scope.itemsList.push({ item: item, qty: 1 });
            }
            $scope.itemToAdd = '';
            $scope.recomputeAmount();
        };
        $scope.removeItem = function(item) {
            $scope.itemsList.splice($scope.itemsList.indexOf(item), 1);
            $scope.recomputeAmount();
        };

        $scope.filterAccounts = function(o) {
            return o.filter($scope.accountToAdd);
        };

        $scope.validate = function() {
            APIAction.meal({
                items: $scope.itemsList,
                accounts: $scope.customersList})
            .then(function() {
                // TODO
            });
        };
    }]
)
;
