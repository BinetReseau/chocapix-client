'use strict';

angular.module('bars.meal', [
])

.controller('meal.ctrl',
    ['$scope', 'api.models.account', 'bars.meal',
    function($scope,Account, Meal) {
        $scope.meal = Meal;
        var accounts = Account.all();
        $scope.accounts = _.reject(accounts, function(n) {
            return n.owner.full_name == 'Bar' && n.owner.username == 'bar'
        });
    }]
)
.directive('popoverMealPopup', [function() {
    return {
        restrict: 'EA',
        templateUrl: 'components/meal/panel.html',
        controller: 'meal.ctrl',
        replace: true,
        scope: {animation: '&', isOpen: '&', placement: '@'}
    };
}])
.directive('popoverMeal', ['$compile', '$timeout', '$parse', '$window', '$tooltip', function ($compile, $timeout, $parse, $window, $tooltip) {
    return $tooltip('popoverMeal', 'popover', 'click');
}])
.factory('bars.meal',
    ['$rootScope', 'api.models.sellitem', 'api.models.account', 'api.services.action', 'auth.user',
    function ($rootScope, SellItem, Account, APIAction, AuthUser) {
        var meal = {
            customersList: [],
            itemsList: [],
            totalPrice: 0,
            accountToAdd: "",
            account: null,
            inRequest: false,
            name: "",
            init: function() {
                this.customersList = [ { account: this.account, ratio: 1, amount: 0 } ];
                this.itemsList = [];
                this.totalPrice = 0;
                this.accountToAdd = "";
                this.inRequest = false;
                this.name = "";
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
                    totalPrice += item.item.fuzzy_price * item.buy_qty;
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
                    qty = 1;
                }
                var other = _.find(this.itemsList, {'item': item});
                if (other) {
                    other.buy_qty += qty;
                } else {
                    this.itemsList.push({ item: item, buy_qty: qty });
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
                    item.qty = item.buy_qty;
                    item.sellitem = item.item;
                    delete item.item;
                });
                var refThis = this;
                APIAction.meal({
                    items: this.itemsList,
                    accounts: this.customersList,
                    name: this.name
                })
                .then(function() {
                    refThis.init();
                });
            },
            in: function() {
                return this.customersList.length > 1 || this.itemsList.length > 0;
            }
        };

        $rootScope.$on('auth.hasLoggedIn', function () {
            meal.account = AuthUser.account;
            meal.init();
        });
        $rootScope.$on('auth.hasLoggedOut', function () {
            meal.init();
        });
        return meal;
    }]
)
;
