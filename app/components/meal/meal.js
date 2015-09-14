'use strict';

angular.module('bars.meal', [
])

.controller('meal.ctrl',
    ['$scope', '$element', '$timeout', '$rootScope', 'api.models.account', 'bars.meal',
    function($scope, $element, $timeout, $rootScope, Account, Meal) {
        $scope.meal = Meal;
        var accounts = Account.all();
        $scope.accountsf = function (v) {
            return _.filter(Account.all(), function (a) {
                return a.filter(v);
            });
        };
        var openned = false;
        var _this = this;
        this.toggle = function () {
            $timeout(function () {
                $element.triggerHandler(openned ? 'close' : 'open');
                openned = !openned;
            });
        };
        var close = function () {
            if (openned) {
                _this.toggle();
            }
        }
        var open = function () {
            if (!openned) {
                _this.toggle();
            }
        }
        $rootScope.$on('auth.hasLoggedOut', close);
        $rootScope.$on('meal.hasBeenValidated', close);
        $rootScope.$on('meal.begin', open);
    }]
)
.directive('popoverMeal', function() {
  return {
    scope: true,
    controller: 'meal.ctrl',
    link: function(scope, element, attrs, ctrl) {
        return element.on('click', ctrl.toggle);
    }
  };
})
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
                this.customersList = [ ];
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
            addItem: function(item, qty, keepClose) {
                if (!this.in() && !keepClose) {
                    $rootScope.$broadcast('meal.begin');
                }
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
            isValidatable: function() {
                return this.totalPrice > 0 && this.customersList.length > 0 && this.itemsList.length > 0;
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
                    $rootScope.$broadcast('meal.hasBeenValidated');
                    refThis.init();
                    document.getElementById("q_alim").focus();
                });
            },
            in: function() {
                //return this.customersList.length > 1 || this.itemsList.length > 0;
                // a faerix, on ne fait que des bouffes à plusieurs.
                // on s'enlève de la bouffe, et on fait logger à qqn d'autre.
                return true;
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
