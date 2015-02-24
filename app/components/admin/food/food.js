'use strict';

angular.module('bars.admin.food', [

])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('bar.admin.food', {
        abstract: true,
        url: "/food",
        controller: 'admin.ctrl.food',
        template: '<ui-view />'
    })
        .state('bar.admin.food.add', {
            url: "/add",
            templateUrl: "components/admin/food/add.html",
            controller: 'admin.ctrl.food.add'
        })
        .state('bar.admin.food.appro', {
            url: "/appro",
            templateUrl: "components/admin/food/appro.html",
            controller: 'admin.ctrl.food.appro'
        })
        .state('bar.admin.food.inventory', {
            url: "/inventory",
            templateUrl: "components/admin/food/inventory.html",
            controller: 'admin.ctrl.food.inventory'
        })
        .state('bar.admin.food.graphs', {
            url: "/graphs",
            templateUrl: "components/admin/food/graphs.html",
            controller: 'admin.ctrl.food.graphs'
        })
    ;
}])

.controller('admin.ctrl.food',
    ['$scope', function ($scope) {
        $scope.admin.active = 'food';
    }]
)
.controller('admin.ctrl.food.add',
    ['$scope', 'api.models.sellitem', 'api.models.itemdetails', 'api.models.buyitem', 'api.models.buyitemprice', 'api.models.stockitem', 'api.services.action',
    function($scope, SellItem, ItemDetails, BuyItem, BuyItemPrice, StockItem, APIAction) {
        $scope.buy_item = BuyItem.create();
        $scope.item_details = ItemDetails.create();
        $scope.sell_item = SellItem.create();
        $scope.stock_item = StockItem.create();
        $scope.buy_item_price = BuyItemPrice.create();

        var add = {};
        $scope.add = add;
        $scope.addFood = function() {
            if ($scope.stock_item.id) {
                var qty = $scope.sell_item.qty/$scope.sell_item.unit_value;
            } else {
                var qty = $scope.sell_item.qty;
            }
            add.go().then(function(newFood) {
                console.log($scope.buy_item);
                APIAction.appro({
                    items: [{buyitem: $scope.buy_item.id, qty: qty}]
                });
            }, function(errors) {
                // TODO: display form errors
            });
        };
    }
])
.controller('admin.ctrl.food.appro',
    ['$scope', '$modal', 'api.models.buyitemprice', 'admin.appro', '$timeout',
    function($scope, $modal, BuyItemPrice, Appro, $timeout) {
        $scope.appro = Appro;
        $scope.buy_item_prices = BuyItemPrice.all();
        $scope.searchl = "";
        $scope.filterItems = function(o) {
            return o.filter(Appro.itemToAdd);
        }
        $scope.filterItemsl = function(o) {
            return o.buyitemprice.filter($scope.searchl);
        }

        $scope.newItem = function (e) {
            if (e.which === 13) {
                if (!isNaN(Appro.itemToAdd)) {
                    var modalNewFood = $modal.open({
                        templateUrl: 'components/admin/food/modalAdd.html',
                        controller: 'admin.ctrl.food.addModal',
                        size: 'lg',
                        resolve: {
                            bar: function () {
                                return $scope.bar.id;
                            },
                            barcode: function () {
                                return Appro.itemToAdd;
                            },
                            fooddetails_list: ['api.models.fooddetails', function(FoodDetails) {
                                return FoodDetails.all();
                            }]
                        }
                    });
                    modalNewFood.result.then(function (newFood) {
                            Appro.addItem(newFood);
                            $timeout(function () {
                                document.getElementById("addApproItemInput").focus();
                            }, 300);
                        }, function () {

                    });
                }
            }
        };
    }
])
.controller('admin.ctrl.food.addModal',
    ['$scope', '$modalInstance', 'api.models.food', 'api.models.fooddetails', 'bar', 'barcode', 'fooddetails_list',
    function($scope, $modalInstance, Food, FoodDetails, bar, barcode, fooddetails_list) {
        $scope.food = Food.create();
        $scope.food_details = FoodDetails.create();

        $scope.food.bar = bar;
        $scope.food_details.barcode = barcode;
        var add = {};
        $scope.add = add;
        $scope.addFood = function() {
            add.go().then(function(newFood) {
                $modalInstance.close(newFood);
            }, function(errors) {
                // TODO: display form errors
            });
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
])
.controller('admin.ctrl.dir.barsadminfoodadd',
    ['$scope', 'api.models.sellitem', 'api.models.itemdetails', 'api.models.stockitem', 'api.models.buyitem', 'api.models.buyitemprice', 'api.services.action', 'OFF',
    function($scope, SellItem, ItemDetails, StockItem, BuyItem, BuyItemPrice, APIAction, OFF) {
        var initDetails = $scope.item_details;
        $scope.barcode = $scope.buy_item.barcode;
        $scope.is_pack = false;

        $scope.stockitems = StockItem.all();
        $scope.itemInPack = "";
        $scope.itemFilter = function(o) {
            return o.filter($scope.itemInPack);
        };
        $scope.choiceBuyItemItem = function(item, model, label) {
            $scope.buy_item.details = item.details.id;
        };

        $scope.add.go = function() {
            function saveFood() {
                return $scope.sell_item.$save().then(function (sellItem) {
                    $scope.stock_item.sellitem = sellItem.id;
                    return $scope.stock_item.$save().then(function (stockItem) {
                        return stockItem;
                    });
                }, function(errors) {
                    // TODO: display form errors
                });
            }

            if ($scope.is_pack) {
                $scope.buy_item.barcode = $scope.barcode;
                return $scope.buy_item.$save().then(function (buyItem) {
                    $scope.buy_item_price.buyitem = buyItem.id;
                    $scope.buy_item.id = buyItem.id;
                    return $scope.buy_item_price.$save();
                });
            } else {
                $scope.item_details.unit_value = 1;
                $scope.stock_item.qty = 0;
                $scope.sell_item.unit_value = 1/$scope.sell_item.unit_value;
                $scope.sell_item.tax *= 0.01;
                $scope.sell_item.name = $scope.item_details.name;
                $scope.sell_item.name_plural = $scope.item_details.name_plural;
                $scope.buy_item.itemqty = 1;
                $scope.stock_item.price = $scope.buy_item_price.price*$scope.sell_item.unit_value;
                $scope.buy_item.barcode = $scope.barcode;

                if ($scope.new_details) {
                    return $scope.item_details.$save().then(function (itemDetails) {
                        $scope.buy_item.details = itemDetails.id;
                        $scope.stock_item.details = itemDetails.id;
                        return $scope.buy_item.$save().then(function (buyItem) {
                            $scope.buy_item.id = buyItem.id;
                            $scope.buy_item_price.buyitem = buyItem.id;
                            return $scope.buy_item_price.$save().then(saveFood);
                        })
                    }, function(errors) {
                        // TODO: display form errors
                    });
                } else {
                    return saveFood();
                }
            }
        };
        $scope.searchDetails = function (barcode) {
            $scope.allow_barcode_edit = true;
            var food_details = _.filter(BuyItem.all(), function (f) {
                return f.barcode == barcode;
            });
            if (food_details.length == 1) {
                $scope.food_details = food_details[food_details.length - 1];
                $scope.new_details = false;
            } else {
                $scope.food_details = initDetails;
                $scope.new_details = true;
            }
        };
        function searchOff() {
            OFF.get($scope.barcode).then(function (infos) {
                if (infos) {
                    if (infos.is_pack) {
                        $scope.is_pack = true;
                        $scope.buy_item.itemqty = parseInt(infos.itemqty);
                    }
                    $scope.item_details.name = infos.name;
                    $scope.item_details.name_plural = infos.name_plural;
                    $scope.item_details.unit_name = infos.buy_unit_name;
                    $scope.item_details.unit_name_plural = infos.buy_unit_name_plural;
                    $scope.sell_item.unit_name = infos.unit_name;
                    $scope.sell_item.unit_name_plural = infos.unit_name_plural;
                    $scope.sell_item.unit_value = infos.unit_value;
                }
            });
        };
        $scope.searchOff = function (e) {
            if (e.which === 13) {
                e.preventDefault();
                searchOff();
            }
        };

        if ($scope.barcode && !initDetails.id) {
            $scope.searchDetails($scope.barcode);
            searchOff();
        }

        $scope.$watch('item_details.name', function (newv, oldv) {
            if ($scope.item_details.name_plural == oldv) {
                $scope.item_details.name_plural = newv;
            }
        });
        $scope.$watch('sell_item.unit_name', function (newv, oldv) {
            if ($scope.sell_item.unit_name_plural == oldv) {
                $scope.sell_item.unit_name_plural = newv;
            }
        });
        $scope.$watch('item_details.unit_name', function (newv, oldv) {
            if ($scope.item_details.unit_name_plural == oldv) {
                $scope.item_details.unit_name_plural = newv;
            }
        });
    }
])
.directive('barsAdminFoodAdd', function() {
    return {
        restrict: 'E',
        scope: {
            sell_item: '=sellItem',
            item_details: '=itemDetails',
            buy_item: '=buyItem',
            buy_item_price: '=buyItemPrice',
            stock_item: '=stockItem',
            add: '=add',
            new_details: '=?newDetails'
        },
        templateUrl: 'components/admin/food/formFood.html',
        controller: 'admin.ctrl.dir.barsadminfoodadd'
    };
})
.controller('admin.ctrl.food.inventory',
    ['$scope', 'api.models.stockitem', 'admin.inventory',
    function($scope, StockItem, Inventory) {
        $scope.admin.active = 'food';

        $scope.inventory = Inventory;
    }
])
.controller('admin.ctrl.food.graphs',
    ['$scope', 'api.models.food',
    function($scope, Food) {
        $scope.admin.active = 'food;'
    }
])

.factory('admin.appro',
    ['api.models.stockitem', 'api.services.action',
    function (StockItem, APIAction) {
        var nb = 0;
        return {
            itemsList: [],
            totalPrice: 0,
            inRequest: false,
            itemToAdd: "",
            init: function() {
                this.itemsList = [];
                this.totalPrice = 0;
                this.inRequest = false;
            },
            recomputeAmount: function() {
                var nbItems = this.itemsList.length;

                var totalPrice = 0;
                _.forEach(this.itemsList, function(item, i) {
                    if (item.qty && item.qty > 0 && item.price) {
                        item.price = item.price * item.qty/(item.old_qty);
                        item.old_qty = item.qty;
                    }
                    totalPrice += item.price;
                });

                this.totalPrice = totalPrice;
            },
            addItem: function(buyitemprice, qty) {
                if (!qty) {
                    qty = 1;
                }
                var other = _.find(this.itemsList, {'buyitemprice': buyitemprice});
                if (other) {
                    other.qty += qty;
                    other.nb = nb++;
                } else {
                    this.itemsList.push({
                        buyitemprice: buyitemprice,
                        qty: qty,
                        old_qty: qty,
                        price: buyitemprice.price * qty,
                        nb: nb++});
                }
                this.recomputeAmount();
                this.itemToAdd = "";
            },
            removeItem: function(item) {
                this.itemsList.splice(this.itemsList.indexOf(item), 1);
                this.recomputeAmount();
            },
            validate: function() {
                this.inRequest = true;
                _.forEach(this.itemsList, function(item, i) {
                    item.qty = item.qty;
                    item.buy_price = item.price / (item.qty);
                    item.buyitem = item.buyitemprice.buyitem;
                });
                var refThis = this;
                APIAction.appro({
                    items: this.itemsList
                })
                .then(function() {
                    refThis.init();
                });
            },
            in: function() {
                return this.itemsList.length > 0;
            }
        };
    }]
)
.factory('admin.inventory',
    ['api.models.stockitem', 'api.services.action',
    function (StockItem, APIAction) {
        var nb = 0;
        return {
            itemsList: [],
            inRequest: false,
            itemToAdd: "",
            init: function() {
                this.itemsList = [];
                this.inRequest = false;
            },
            addItem: function(item, qty) {
                if (!qty) {
                    qty = item.unit_value;
                }
                var other = _.find(this.itemsList, {'item': item});
                if (other) {
                    other.qty += qty/item.unit_value;
                    other.nb = nb++;
                } else {
                    this.itemsList.push({ item: item, qty: qty/item.unit_value, unit_value: item.details.unit_value, nb: nb++ });
                }
                this.itemToAdd = "";
            },
            removeItem: function(item) {
                this.itemsList.splice(this.itemsList.indexOf(item), 1);
            },
            validate: function() {
                this.inRequest = true;
                _.forEach(this.itemsList, function(item, i) {
                    item.qty = item.qty * item.unit_value;
                });
                var refThis = this;
                APIAction.inventory({
                    items: this.itemsList
                })
                .then(function() {
                    refThis.init();
                });
            },
            in: function() {
                return this.itemsList.length > 0;
            }
        };
    }]
)
;
