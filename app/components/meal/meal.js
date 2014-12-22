'use strict';

angular.module('bars.meal', [
])

.controller('meal.ctrl',
    ['$scope', 'api.models.food', 'api.models.account', 'api.services.action', 'bars.meal',
    function($scope, Food, Account, APIAction, Meal) {
        Meal.account = $scope.user.account;
        Meal.init();
        $scope.meal = Meal;
        function init() {
            $scope.customersList = [ { account: $scope.user.account, ratio: 1, amount: 0 } ];
            $scope.itemsList = [];
            $scope.totalPrice = 0;
            $scope.accountToAdd = "";
        }
        init();

        $scope.recomputeAmount = function() {
            var nbParts = 0; // nombre de parts pour le calcul (somme des ratios)
            _.forEach($scope.customersList, function(customer) {
                nbParts += customer.ratio;
            });

            var nbCustomers = $scope.customersList.length;
            var nbItems = $scope.itemsList.length;

            var totalPrice = 0;
            _.forEach($scope.itemsList, function(item, i) {
                totalPrice += item.item.price * item.buy_qty * item.item.unit_value;
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
                other.buy_qty += 1;
            } else {
                $scope.itemsList.push({ item: item, buy_qty: 1 });
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
            $scope.inRequest = true;
            _.forEach($scope.itemsList, function(item, i) {
                item.qty = item.buy_qty * item.item.unit_value;
            });
            APIAction.meal({
                items: $scope.itemsList,
                accounts: $scope.customersList})
            .then(function() {
                init();
            });
        };
    }]
)

.factory('bars.meal',
    ['api.models.food', 'api.models.account', 'api.services.action',
    function (Food, Account, APIAction) {
        return {
            customersList: [],
            itemsList: [],
            totalPrice: 0,
            accountToAdd: "",
            account: null,
            inRequest: false,
            init: function() {
                this.customersList = [ { account: this.account, ratio: 1, amount: 0 } ];
                this.itemsList = [];
                this.totalPrice = 0;
                this.accountToAdd = "";
            },
            recomputeAmount: function() {
                var nbParts = 0; // nombre de parts pour le calcul (somme des ratios)
                _.forEach(this.customersList, function(customer) {
                    nbParts += customer.ratio;
                });

                var nbCustomers = this.customersList.length;
                var nbItems = this.itemsList.length;

                var totalPrice = 0;
                _.forEach(this.itemsList, function(item, i) {
                    totalPrice += item.item.price * item.buy_qty * item.item.unit_value;
                });

                _.forEach(this.customersList, function(customer) {
                    customer.amount = totalPrice * customer.ratio / nbParts;
                });
                this.totalPrice = totalPrice;
            },
            addCustomer: function(account, model, label) {
                var other = _.find(this.customersList, {'account': account});
                if (!other) {
                    this.customersList.push({ account: account, ratio: 1, amount: 0 });
                }
                this.accountToAdd = '';
                this.recomputeAmount();
            },
            removeCustomer: function(cstmr) {
                this.customersList.splice(this.customersList.indexOf(cstmr), 1);
                this.recomputeAmount();
            },
            addItem: function(item, model, label) {
                var other = _.find(this.itemsList, {'item': item});
                if (other) {
                    other.buy_qty += 1;
                } else {
                    this.itemsList.push({ item: item, buy_qty: 1 });
                }
                this.itemToAdd = '';
                this.recomputeAmount();
            },
            removeItem: function(item) {
                this.itemsList.splice(this.itemsList.indexOf(item), 1);
                this.recomputeAmount();
            },
            filterAccounts: function(o) {
                return o.filter(this.accountToAdd);
            },
            validate: function() {
                this.inRequest = true;
                _.forEach(this.itemsList, function(item, i) {
                    item.qty = item.buy_qty * item.item.unit_value;
                });
                APIAction.meal({
                    items: this.itemsList,
                    accounts: this.customersList
                })
                .then(function() {
                    this.init();
                });
            }
        };
    }]
)
;
