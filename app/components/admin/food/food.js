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
        .state('bar.admin.food.stockitems_list', {
            url: "/stock-list",
            templateUrl: "components/admin/food/stockitems-list.html",
            controller: 'admin.ctrl.food.stockitems_list',
            resolve: {
                stockitem_list: ['api.models.stockitem', function(StockItem) {
                    return StockItem.all();
                }]
            }
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
    ['$scope',
    function($scope) {
        var callback = function (o) {
            console.log(o);
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
        $(window).bind('beforeunload', function() {
            if (Appro.in()) {
                return "Attention, vous allez perdre l'appro en cours !"
            }
        });
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
        var init_items;
        var data;
        function init() {
            data = {
                barcode: '',
                is_pack: false,
                new_sell: true,
                bi_id: null,
                bip_id: null,
                id_id: null,
                sti_id: null,
                sei_id: null,
                bi_itemqty: null,
                bip_price: '',
                id_name: '',
                id_name_plural: '',
                sti_sell_to_buy: '',
                sei_name: '',
                sei_name_plural: '',
                sei_unit_name: '',
                sei_unit_name_plural: '',
                sei_tax: '',
                keywords: ''
            };
            $scope.allow_barcode_edit = true;
            // $scope.buy_item = BuyItem.create();
            // $scope.item_details = ItemDetails.create();
            // $scope.sell_item = SellItem.create();
            // $scope.stock_item = StockItem.create();
            // $scope.buy_item_price = BuyItemPrice.create();
            //
            // init_items = {
            //     buy_item: $scope.buy_item,
            //     item_details: $scope.item_details,
            //     sell_item: $scope.sell_item,
            //     stock_item: $scope.stock_item,
            //     buy_item_price: $scope.buy_item_price
            // };
            //
            // $scope.itemInPack = "";
            // $scope.oldSellItem = "";
            // $scope.is_pack = false;
            // $scope.new_sell = true;
            // $scope.allow_barcode_edit = true;
            $timeout(function () {
                document.getElementById("fbarcode").focus();
            }, 300);
        }
        init();
        data.barcode = $scope.barcode;
        if (data.barcode && data.barcode != "") {
            $scope.allow_barcode_edit = false;
            search(data.barcode);
        }
        $scope.data = data;

        function resetf() {
            init();
        }

        $scope.new_details = function () {
            return data.bi_details_id == undefined;
        };

        // Cherche dans la bdd globale
        // Appelée par search() (basic = false) et par ng-change sur barcode (basic = true)
        function searchGlobal (barcode, basic) {
            // On regarde si le bar vend déjà ce code-barre
            var buy_item_price = _.find(BuyItemPrice.all(), function (f) {
                return f.buyitem.barcode == barcode;
            });
            // Le BuyItemPrice n'existe pas, l'aliment n'a jamais été acheté par le bar
            // On va voir si le BuyItem correspondant existe
            if (!buy_item_price && !basic) {
                return BuyItem.request({barcode: barcode}).then(function (bis) {
                    if (bis.length > 0) {
                        // Le BuyItem existe déjà (et l'ItemDetails associé)
                        var buy_item = bis[bis.length - 1];
                        data.bi_id = buy_item.id;
                        data.bi_itemqty = buy_item.itemqty;
                        data.id_id = buy_item.details.id;
                        data.id_name = buy_item.details.name;
                        data.id_name_plural = buy_item.details.name_plural;
                        $scope.itemInPack = $scope.item_details.name;
                        // A-t-on besoin de créer le StockItem ?
                        var stockItem = _.find(StockItem.all(), function (i) {
                            return i.details.id == data.id_id;
                        });

                        if ($scope.buy_item.itemqty != 1) {
                            data.is_pack = true;
                        } else {
                            data.is_pack = false;
                        }

                        if (data.is_pack && !stockItem) {
                            var modalNewFood = $modal.open({
                                templateUrl: 'components/admin/food/modalAdd.html',
                                controller: 'admin.ctrl.food.addModal',
                                size: 'lg',
                                resolve: {
                                    barcode: function () {
                                        return undefined;
                                    },
                                    item_details: function () {
                                        return $scope.item_details;
                                    }
                                }
                            });
                            modalNewFood.result.then(function (buyItemPrice) {

                                }, function () {

                            });
                        } else if (stockItem) {
                            data.sti_id = stockItem.id;
                            data.sti_sell_to_buy = stockItem.sell_to_buy;
                        }
                        return true;
                    }
                    return false;
                });
            } else if (buy_item_price) {
                // $scope.buy_item_price = buy_item_price;
                // $scope.buy_item = buy_item_price.buyitem;
                // $scope.item_details = buy_item_price.buyitem.details;
                //
                // var stock_item = _.find(StockItem.all(), function (si) {
                //     return si.details == buy_item_price.buyitem.details;
                // });
                // if (stock_item) {
                //     $scope.barcodeErrorSI = stock_item;
                //     $scope.block = true;
                //     $scope.stock_item = stock_item;
                //     $scope.sell_item = stock_item.sellitem;
                //     return false;
                // }
                $scope.barcodeErrorSI = true;
                $scope.block = false;
                return true;
            } else {
                data.bi_id = null;
                data.bi_itemqty = '';
                data.id_id = null;
                data.id_name = '';
                data.id_name_plural = '';
                $scope.itemInPack = '';
            }
            if (basic) {
                $scope.block = false;
                delete $scope.barcodeErrorSI;
            }
            return false;
        };

        // Recherche sur OpenFoodFacts
        function searchOff(barcode) {
            OFF.get(barcode).then(function (infos) {
                if (infos) {
                    if (infos.is_pack) {
                        data.is_pack = true;
                        data.bi_itemqty = parseInt(infos.itemqty);
                    }
                    data.id_name = infos.name;
                    data.id_name_plural = infos.name_plural;
                    data.sei_name = infos.sell_name;
                    data.sei_name_plural = infos.sell_name_plural;
                    data.sei_unit_name = infos.unit_name;
                    data.sei_unit_name_plural = infos.unit_name_plural;
                    data.sti_sell_to_buy = infos.sell_to_buy;
                }
            });
        };

        function search(barcode) {
            if (!$scope.block) {
                var rs = searchGlobal(barcode);
                if (rs !== true && rs !== false) {
                    rs.then(function (result) {
                        if (!result) {
                            searchOff(barcode);
                        }
                    });
                }
            }
        }

        // Lancer une recherche en faisant Entrée
        $scope.searchf = function (e) {
            if (e.which === 13) {
                e.preventDefault();
                search(data.barcode);
            }
        };

        $scope.searchGlobal = searchGlobal;

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
            data.id_id = item.buyitem.details.id;
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
            data.sei_id = item.id;
            data.sei_name = item.name;
            data.sei_name_plural = item.name_plural;
            data.sei_unit_name = item.unit_name;
            data.sei_unit_name_plural = item.unit_name_plural;
            data.keywords = item.keywords;
        };

        $scope.addFood = function() {
            // function saveFood() {
            //     if ($scope.new_sell) {
            //         $scope.sell_item.tax *= 0.01;
            //         return $scope.sell_item.$save().then(function (sellItem) {
            //             $scope.stock_item.sellitem = sellItem;
            //             return $scope.stock_item.$save().then(function (stockItem) {
            //                 resetf();
            //                 return stockItem;
            //             });
            //         }, function(errors) {
            //             // TODO: display form errors
            //         });
            //     } else {
            //         return $scope.stock_item.$save().then(function (stockItem) {
            //             resetf();
            //             return stockItem;
            //         });
            //     }
            // }
            //
            // if ($scope.is_pack) {
            //     if ($scope.buy_item.id) {
            //         return $scope.buy_item_price.$save();
            //     } else {
            //         $scope.buy_item.barcode = $scope.barcode;
            //         return $scope.buy_item.$save().then(function (buyItem) {
            //             $scope.buy_item_price.buyitem = buyItem;
            //             $scope.buy_item.id = buyItem.id;
            //             resetf();
            //             return $scope.buy_item_price.$save();
            //         });
            //     }
            // } else {
            //     $scope.stock_item.qty = 0;
            //     $scope.stock_item.sell_to_buy = 1/$scope.stock_item.sell_to_buy;
            //     $scope.stock_item.price = $scope.buy_item_price.price;
            //
            //     if ($scope.new_details) {
            //         $scope.buy_item.itemqty = 1;
            //         $scope.buy_item.barcode = $scope.barcode;
            //
            //         return $scope.item_details.$save().then(function (itemDetails) {
            //             $scope.buy_item.details = itemDetails;
            //             $scope.stock_item.details = itemDetails;
            //             return $scope.buy_item.$save().then(function (buyItem) {
            //                 $scope.buy_item.id = buyItem.id;
            //                 $scope.buy_item_price.buyitem = buyItem;
            //                 return $scope.buy_item_price.$save().then(saveFood);
            //             })
            //         }, function(errors) {
            //             // TODO: display form errors
            //         });
            //     } else {
            //         $scope.stock_item.details = $scope.item_details;
            //         $scope.buy_item_price.buyitem = $scope.buy_item;
            //         return $scope.buy_item_price.$save().then(saveFood);
            //     }
            // }

            // Création
            var buy_item = BuyItem.create();
            var buy_item_price = BuyItemPrice.create();
            var item_details = ItemDetails.create();
            var stock_item = StockItem.create();
            var sell_item = SellItem.create();

            // Préparation
            buy_item_price.price = data.bip_price;
            stock_item.sell_to_buy = 1/data.sti_sell_to_buy;
            stock_item.price = data.bip_price;
            if (!data.bi_id) {
                buy_item.barcode = data.barcode;
                if (data.is_pack) {
                    buy_item.itemqty = data.bi_itemqty;
                } else {
                    buy_item.itemqty = 1;
                }
            } else {
                buy_item_price.buyitem = data.bi_id;
            }
            if (!data.id_id) {
                item_details.name = data.id_name;
                item_details.name_plural = data.id_name_plural;
                item_details.keywords = data.keywords;
            } else {
                buy_item.details = data.id_id;
                stock_item.details = data.id_id;
            }
            if (!data.sei_id) {
                sell_item.name = data.sei_name;
                sell_item.name_plural = data.sei_name_plural;
                sell_item.keywords = data.keywords;
                sell_item.unit_name = data.sei_unit_name;
                sell_item.unit_name_plural = data.sei_unit_name_plural;
                sell_item.tax = data.sei_tax*0.01;
            } else {
                stock_item.sellitem = data.sei_id;
            }
            console.log(data);
            console.log(buy_item);
            console.log(buy_item_price);
            console.log(item_details);
            console.log(stock_item);
            console.log(sell_item);

            // Enregistrement
            function deleteEntities() {
                buy_item.$delete();
                buy_item_price.$delete();
                item_details.$delete();
                stock_item.$delete();
                sell_item.$delete();
            }
            function saveBuyItemPrice() {
                buy_item_price.$save().then(function (bip) {
                    buy_item_price = bip;
                }, deleteEntities);
            }
            function saveBuyItem() {
                if (!data.bi_id) {
                    buy_item.$save().then(function (bi) {
                        buy_item = bi;
                        buy_item_price.buyitem = bi.id;
                        saveBuyItemPrice();
                    }, deleteEntities);
                } else {
                    saveBuyItemPrice();
                }
            }
            function saveItemDetails() {
                if (!data.id_id) {
                    item_details.$save().then(function (id) {
                        item_details = id;
                        stock_item.details = id.id;
                        buy_item.details = id.id;
                        saveBuyItem();
                        saveSellItem();
                    }, deleteEntities);
                } else {
                    saveBuyItem();
                    saveSellItem();
                }
            }
            function saveSellItem() {
                if (!data.sei_id) {
                    sell_item.$save().then(function (sei) {
                        sell_item = sei;
                        stock_item.sellitem = sei.id;
                        saveStockItem();
                    }, deleteEntities);
                } else {
                    saveStockItem();
                }
            }
            function saveStockItem() {
                stock_item.$save().then(function (sti) {
                    stock_item = sti;
                }, deleteEntities);
            }

            saveItemDetails();
        };

        $scope.isValid = function () {
            return data.bip_price &&
                (
                    (data.is_pack // C'est un pack
                        && data.bi_itemqty && data.id_id) ||
                    (!data.is_pack // Ce n'est pas un pack
                        && (
                            (data.new_sell // C'est un nouvel aliment
                                && data.id_name && data.id_name_plural
                                && data.sei_name && data.sei_name_plural && data.sei_tax
                                && data.sti_sell_to_buy
                            ) ||
                            (!data.new_sell
                                && data.sei_id && data.sti_sell_to_buy
                            )
                        )
                    )
                );
        };

        $scope.$watch('data.id_name', function (newv, oldv) {
            if (data.id_name_plural == oldv) {
                data.id_name_plural = newv;
            }
        });
        $scope.$watch('data.sei_name', function (newv, oldv) {
            if (data.sei_name_plural == oldv) {
                data.sei_name_plural = newv;
            }
        });
        $scope.$watch('data.sei_unit_name', function (newv, oldv) {
            if (data.sei_unit_name_plural == oldv) {
                data.sei_unit_name_plural = newv;
            }
        });
    }
])
.directive('barsAdminFoodAdd', function() {
    return {
        restrict: 'E',
        scope: {
            barcode: '=?barcode',
            callback: '&?callback'
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

        $(window).bind('beforeunload', function() {
            if (Inventory.in()) {
                return "Attention, vous allez perdre l'inventaire en cours !"
            }
        });

        $scope.inventory = Inventory;
    }
])
.controller('admin.ctrl.food.graphs',
    ['$scope',
    function($scope) {
        $scope.admin.active = 'food;'
    }
])
.controller('admin.ctrl.food.stockitems_list',
    ['$scope', 'stockitem_list',
    function($scope, stockitem_list){
        $scope.stockitem_list = stockitem_list;
        $scope.searchl = "";
        $scope.list_order = 'details.name';
        $scope.reverse = false;
        $scope.filterItems = function(o) {
            return o.filter($scope.searchl);
        }
        $scope.filterHidden = function() {
            if ($scope.showHidden) {
                return '';
            } else {
                return {
                    deleted: false
                };
            }
        };
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
            totalPrice: 0,
            init: function() {
                this.itemsList = [];
                this.inRequest = false;
                this.totalPrice = 0;
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
                    this.itemsList.push({ stockitem: stockitem, qty: qty, sell_to_buy: 1, nb: nb++, qty_diff: 0 });
                }
                this.itemToAdd = "";
                this.recomputeAmount();
            },
            removeItem: function(item) {
                this.itemsList.splice(this.itemsList.indexOf(item), 1);
            },
            recomputeAmount: function() {
                var totalPrice = 0;
                _.forEach(this.itemsList, function(item, i) {
                    if (item.qty) {
                        item.qty_diff = item.qty * item.sell_to_buy / item.stockitem.sell_to_buy - item.stockitem.qty;
                    }
                    totalPrice += item.qty_diff * item.stockitem.price;
                });

                this.totalPrice = totalPrice;
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
