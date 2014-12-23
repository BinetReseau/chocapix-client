'use strict';

angular.module('bars.meal', [
])

.controller('meal.ctrl',
    ['$scope', 'api.models.food', 'api.models.account', 'api.services.action', 'bars.meal',
    function($scope, Food, Account, APIAction, Meal) {
        Meal.account = $scope.user.account;
        Meal.init();
        $scope.meal = Meal;
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
            mealName: "",
            init: function() {
                this.customersList = [ { account: this.account, ratio: 1, amount: 0 } ];
                this.itemsList = [];
                this.totalPrice = 0;
                this.accountToAdd = "";
                this.inRequest = false;
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
            addItem: function(item, qty) {
                if (!qty) {
                    qty = item.unit_value;
                }
                var other = _.find(this.itemsList, {'item': item});
                if (other) {
                    other.buy_qty += qty/item.unit_value;
                } else {
                    this.itemsList.push({ item: item, buy_qty: qty/item.unit_value });
                }
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
                var refThis = this;
                APIAction.meal({
                    items: this.itemsList,
                    accounts: this.customersList
                })
                .then(function() {
                    refThis.init();
                });
            },
            in: function() {
                return this.customersList.length > 1 || this.itemsList.length > 0;
            }
        };
    }]
)
;
