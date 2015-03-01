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
        .state('bar.admin.food.regroup', {
            url: "/regroup",
            templateUrl: "components/admin/food/regroup.html",
            controller: 'admin.ctrl.food.regroup',
            resolve: {
                sellitem_list: ['api.models.sellitem', function(SellItem) {
                    return SellItem.all();
                }]
            }
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
        function init() {
            $scope.buy_item = BuyItem.create();
            $scope.item_details = ItemDetails.create();
            $scope.sell_item = SellItem.create();
            $scope.stock_item = StockItem.create();
            $scope.buy_item_price = BuyItemPrice.create();
        }
        init();

        var add = {};
        $scope.add = add;
        $scope.addFood = function() {
            if ($scope.stock_item.id) {
                var qty = $scope.sell_item.qty/$scope.sell_item.unit_value;
            } else {
                var qty = $scope.sell_item.qty;
            }
            add.go().then(function(newFood) {
                if (qty > 0) {
                    APIAction.appro({
                        items: [{buyitem: $scope.buy_item.id, qty: qty}]
                    }).then(init);
                } else {
                    init();
                }
            }, function(errors) {
                // TODO: display form errors
            });
        };
    }
])
.controller('admin.ctrl.food.regroup',
    ['$scope', 'api.models.sellitem', 'api.models.stockitem', 'api.services.action', 'sellitem_list', 'APIInterface',
    function($scope, SellItem, StockItem, APIAction, sellitem_list, APIInterface) {
        document.getElementById("sellitemNameInput").focus();
        $scope.sell_item = SellItem.create();
        $scope.sellitem_list = sellitem_list;
        $scope.sellitems_grp = [];
        $scope.searchl = "";
        $scope.searchll = "";
        $scope.filterItems = function(o) {
            return o.filter($scope.searchl);
        };
        $scope.filterItemsl = function(o) {
            return o.filter($scope.searchll);
        };
        $scope.addItem = function(item) {
            var other = _.find($scope.sellitems_grp, item);
            if (!other) {
                item.unit_factor = 1;
                $scope.sellitems_grp.push(item);
                $scope.sellitem_list.splice($scope.sellitem_list.indexOf(item), 1);
                $scope.searchl = "";
                console.log($scope.sellitems_grp);
            }
        };
        $scope.removeItem = function(item) {
            var index = $scope.sellitems_grp.indexOf(item);
            $scope.sellitems_grp.splice(index, 1);
            delete(item.unit_factor);
            $scope.sellitem_list.push(item);
        };
        $scope.validate = function() {
            // Modification du premier SellItem
            $scope.sell_item_ref = $scope.sellitems_grp.shift();
            $scope.sell_item_ref.name = $scope.sell_item.name;
            $scope.sell_item_ref.unit_name = $scope.sell_item.unit_name;
            $scope.sell_item_ref.name_plural = $scope.sell_item.name_plural;
            $scope.sell_item_ref.unit_name_plural = $scope.sell_item.unit_name_plural;
            $scope.sell_item_ref.tax = $scope.sell_item.tax;
            var refId = $scope.sell_item_ref.id;
            var unit_factor = 1/$scope.sell_item_ref.unit_factor;
            $scope.sell_item_ref.$save().then(function(newSellItem) {
                while ($scope.sellitems_grp.length > 0) {
                    var itemToMerge = $scope.sellitems_grp.shift();
                    unit_factor = itemToMerge.unit_factor;
                    APIInterface.request({
                        'url': 'sellitem/' + refId + '/merge',
                        'method': 'PUT',
                        'data': {'sellitem': itemToMerge.id, 'unit_factor': unit_factor}
                    });
                }
            })
        };
    }
])
.controller('admin.ctrl.food.appro',
    ['$scope', '$modal', 'api.models.buyitemprice', 'api.models.stockitem', 'admin.appro', '$timeout',
    function($scope, $modal, BuyItemPrice, StockItem, Appro, $timeout) {
        $scope.appro = Appro;
        $scope.buy_item_prices = BuyItemPrice.all();
        $scope.searchl = "";
        $scope.filterItemsl = function(o) {
            return o.buyitemprice.filter($scope.searchl);
        };
        $scope.filterItems = function(o) {
            return o.filter(Appro.itemToAdd);
        };
        $scope.buy_item_pricesf = function(v) {
            return _.filter($scope.buy_item_prices, function (bip) {
                return bip.filter(v);
            });
        };

        $scope.newItem = function (e) {
            if (e.which === 13) {
                if (!isNaN(Appro.itemToAdd)) {
                    var modalNewFood = $modal.open({
                        templateUrl: 'components/admin/food/modalAdd.html',
                        controller: 'admin.ctrl.food.addModal',
                        size: 'lg',
                        resolve: {
                            barcode: function () {
                                return Appro.itemToAdd;
                            },
                            buy_item_price: function () {
                                return undefined;
                            }
                        }
                    });
                    modalNewFood.result.then(function (buyItemPrice) {
                            Appro.addItem(buyItemPrice);
                            $timeout(function () {
                                document.getElementById("addApproItemInput").focus();
                            }, 300);
                        }, function () {

                    });
                }
            }
        };
        $timeout(function () {
            document.getElementById("addApproItemInput").focus();
        }, 300);
    }
])
.controller('admin.ctrl.food.addModal',
    ['$scope', '$modalInstance', 'api.models.sellitem', 'api.models.itemdetails', 'api.models.buyitem', 'api.models.buyitemprice', 'api.models.stockitem', 'barcode', 'buy_item_price',
    function($scope, $modalInstance, SellItem, ItemDetails, BuyItem, BuyItemPrice, StockItem, barcode, buy_item_price) {
        if (buy_item_price) {
            $scope.buy_item_price = buy_item_price;
            $scope.buy_item = buy_item_price.buyitem;
            $scope.item_details = buy_item_price.buyitem.details;
        } else {
            $scope.buy_item_price = BuyItemPrice.create();
            $scope.buy_item = BuyItem.create();
            $scope.item_details = ItemDetails.create();
            $scope.buy_item.barcode = barcode;
        }
        $scope.sell_item = SellItem.create();
        $scope.stock_item = StockItem.create();

        var add = {};
        $scope.add = add;
        $scope.addFood = function() {
            add.go().then(function(newFood) {
                $modalInstance.close($scope.buy_item_price);
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
    ['$scope', '$modal', '$timeout', 'api.models.sellitem', 'api.models.itemdetails', 'api.models.stockitem', 'api.models.buyitem', 'api.models.buyitemprice', 'api.services.action', 'OFF',
    function($scope, $modal, $timeout, SellItem, ItemDetails, StockItem, BuyItem, BuyItemPrice, APIAction, OFF) {
        var initDetails = $scope.item_details;
        var initBuy = $scope.buy_item;
        $scope.barcode = $scope.buy_item.barcode;
        $scope.is_pack = false;
        $scope.new_sell = !$scope.sell_item.id;
        $scope.new_details = !$scope.item_details.id;

        function searchDetails (barcode) {
            $scope.allow_barcode_edit = true;
            // On regarde si le bar vend déjà ce code-barre
            var buy_item_prices = _.filter(BuyItemPrice.all(), function (f) {
                return f.buyitem.barcode == barcode;
            });
            // Le BuyItemPrice n'existe pas, l'aliment n'a jamais été acheté par le bar
            if (buy_item_prices.length == 0) {
                $scope.buy_item_price.barcode = barcode;
                return $scope.buy_item_price.$save().then(function (nbip) {
                    // Le BuyItem existe déjà (et l'ItemDetails associé)
                    $scope.buy_item_price = nbip;
                    $scope.buy_item = nbip.buyitem;
                    $scope.item_details = nbip.buyitem.details;
                    $scope.new_details = false;
                    $scope.itemInPack = $scope.item_details.name;
                    // A-t-on besoin de créer le StockItem ?
                    var stockItem = _.find(StockItem.all(), function (i) {
                        return i.details.id == nbip.buyitem.details.id;
                    });

                    if ($scope.buy_item.itemqty != 1) {
                        $scope.is_pack = true;
                    } else {
                        $scope.is_pack = false;
                    }

                    if ($scope.buy_item.itemqty != 1 && !stockItem) {
                        var modalNewFood = $modal.open({
                            templateUrl: 'components/admin/food/modalAdd.html',
                            controller: 'admin.ctrl.food.addModal',
                            size: 'lg',
                            resolve: {
                                barcode: function () {
                                    return undefined;
                                },
                                buy_item_price: function () {
                                    return nbip;
                                }
                            }
                        });
                        modalNewFood.result.then(function (buyItemPrice) {

                            }, function () {

                        });
                    }
                    return true;
                }, function (error) {
                    // On fait rien, tout doit être créé
                    return false;
                });
            } else {
                return true;
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
                    $scope.sell_item.name = infos.sell_name;
                    $scope.sell_item.name_plural = infos.sell_name_plural;
                    $scope.sell_item.unit_name = infos.unit_name;
                    $scope.sell_item.unit_name_plural = infos.unit_name_plural;
                    $scope.stock_item.sell_to_buy = infos.sell_to_buy;
                }
            });
        };

        function search() {
            var rs = searchDetails($scope.barcode);
            if (rs !== true) {
                rs.then(function (result) {
                    if (!result) {
                        searchOff();
                    }
                    if ($scope.item_details.id) {
                        $scope.new_details = false;
                        $scope.allow_barcode_edit = false;
                    }
                });
            }
        }

        // On a un code-barre mais pas l'ItemDetails
        if ($scope.barcode && !$scope.item_details.id) {
            // On cherche dans les aliments communs
            // et si on trouve pas on cherche sur OpenFoodFacts
            search();
        }

        // Lancer une recherche en faisant Entrée
        $scope.searchf = function (e) {
            if (e.which === 13) {
                e.preventDefault();
                search();
            }
        };

        // Si on est en train d'ajouter un pack, on scanne un item, et il n'existe pas
        $scope.createItemPack = function (e) {
            if (e.which === 13) {
                e.preventDefault();
                if (!isNaN($scope.itemInPack)) {
                    var modalNewFood = $modal.open({
                        templateUrl: 'components/admin/food/modalAdd.html',
                        controller: 'admin.ctrl.food.addModal',
                        size: 'lg',
                        resolve: {
                            barcode: function () {
                                return $scope.itemInPack;
                            },
                            buy_item_price: function () {
                                return undefined;
                            }
                        }
                    });
                    modalNewFood.result.then(function (buyItemPrice) {
                            $scope.choiceItemDetail(buyItemPrice);
                            $scope.itemInPack = buyItemPrice.buyitem.details.name;
                        }, function () {

                    });
                }
            }
        };

        // Typehead for BuyItemPrices choice
        $scope.buy_item_prices = BuyItemPrice.all();
        $scope.buy_item_pricesf = function (v) {
            return _.uniq(_.filter($scope.buy_item_prices, function (o) {
                return o.filter(v);
            }), false, function (bip) {
                return bip.buyitem.details;
            });
        };
        $scope.itemInPack = "";
        $scope.choiceItemDetail = function(item, model, label) {
            $scope.buy_item.details = item.buyitem.details.id;
        };
        // Typehead for SellItem choice
        $scope.sellitems = SellItem.all();
        $scope.sellitemsf = function (v) {
            return _.filter($scope.sellitems, function (o) {
                return o.filter(v);
            });
        };
        $scope.oldSellItem = "";
        $scope.choiceSellItem = function(item, model, label) {
            $scope.stock_item.sellitem = item;
            $scope.sell_item = item;
        };

        $scope.add.go = function() {
            function saveFood() {
                if ($scope.new_sell) {
                    $scope.sell_item.tax *= 0.01;
                    return $scope.sell_item.$save().then(function (sellItem) {
                        $scope.stock_item.sellitem = sellItem;
                        return $scope.stock_item.$save().then(function (stockItem) {
                            return stockItem;
                        });
                    }, function(errors) {
                        // TODO: display form errors
                    });
                } else {
                    return $scope.stock_item.$save().then(function (stockItem) {
                        return stockItem;
                    });
                }
            }

            if ($scope.is_pack) {
                if ($scope.buy_item.id) {
                    return $scope.buy_item_price.$save();
                } else {
                    $scope.buy_item.barcode = $scope.barcode;
                    return $scope.buy_item.$save().then(function (buyItem) {
                        $scope.buy_item_price.buyitem = buyItem;
                        $scope.buy_item.id = buyItem.id;
                        return $scope.buy_item_price.$save();
                    });
                }
            } else {
                $scope.stock_item.qty = 0;
                $scope.stock_item.sell_to_buy = 1/$scope.stock_item.sell_to_buy;
                $scope.stock_item.price = $scope.buy_item_price.price;

                if ($scope.new_details) {
                    $scope.buy_item.itemqty = 1;
                    $scope.buy_item.barcode = $scope.barcode;

                    return $scope.item_details.$save().then(function (itemDetails) {
                        $scope.buy_item.details = itemDetails;
                        $scope.stock_item.details = itemDetails;
                        return $scope.buy_item.$save().then(function (buyItem) {
                            $scope.buy_item.id = buyItem.id;
                            $scope.buy_item_price.buyitem = buyItem;
                            return $scope.buy_item_price.$save().then(saveFood);
                        })
                    }, function(errors) {
                        // TODO: display form errors
                    });
                } else {
                    $scope.stock_item.details = $scope.item_details;
                    $scope.buy_item_price.buyitem = $scope.buy_item;
                    return $scope.buy_item_price.$save().then(saveFood);
                }
            }
        };

        $scope.$watch('item_details.name', function (newv, oldv) {
            if ($scope.item_details.name_plural == oldv) {
                $scope.item_details.name_plural = newv;
            }
        });
        $scope.$watch('sell_item.name', function (newv, oldv) {
            if ($scope.sell_item.name_plural == oldv) {
                $scope.sell_item.name_plural = newv;
            }
        });
        $scope.$watch('sell_item.unit_name', function (newv, oldv) {
            if ($scope.sell_item.unit_name_plural == oldv) {
                $scope.sell_item.unit_name_plural = newv;
            }
        });

        $timeout(function () {
            document.getElementById("fbarcode").focus();
        }, 300);
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
    ['$scope', '$timeout', 'api.models.buyitemprice', 'admin.inventory',
    function($scope, $timeout, BuyItemPrice, Inventory) {
        $scope.admin.active = 'food';

        var buy_item_prices = BuyItemPrice.all();
        $scope.buy_item_pricesf = function (v) {
            return _.filter(buy_item_prices, function (bip) {
                return bip.filter(v);
            });
        };

        $scope.searchi = '';
        $scope.filterl = function (o) {
            return o.stockitem.filter($scope.searchi);
        };

        $timeout(function () {
            document.getElementById("addInventoryItemInput").focus();
        }, 300);

        $scope.inventory = Inventory;
    }
])
.controller('admin.ctrl.food.graphs',
    ['$scope',
    function($scope) {
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
                    qty = item.buyitem.itemqty;
                }
                var stockitem = item.buyitem.details.stockitem;
                var other = _.find(this.itemsList, {'stockitem': stockitem});
                if (other) {
                    other.qty += qty / other.sell_to_buy;
                    other.nb = nb++;
                } else {
                    this.itemsList.push({ stockitem: stockitem, qty: qty, sell_to_buy: 1, nb: nb++ });
                }
                this.itemToAdd = "";
            },
            removeItem: function(item) {
                this.itemsList.splice(this.itemsList.indexOf(item), 1);
            },
            validate: function() {
                this.inRequest = true;
                _.forEach(this.itemsList, function(item, i) {
                    item.qty = item.qty / item.stockitem.sell_to_buy * item.sell_to_buy;
                    delete item.sell_to_buy;
                    delete item.nb;
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
