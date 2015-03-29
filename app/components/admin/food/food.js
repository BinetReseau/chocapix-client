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
        $scope.origin = {
            callback: function (o) {
                console.log(o);
            }
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
                            buy_item: function () {
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
    ['$scope', '$modalInstance', 'api.models.sellitem', 'api.models.itemdetails', 'api.models.buyitem', 'api.models.buyitemprice', 'api.models.stockitem', 'barcode', 'buy_item',
    function($scope, $modalInstance, SellItem, ItemDetails, BuyItem, BuyItemPrice, StockItem, barcode, buy_item) {
        $scope.barcode = barcode;
        $scope.buy_item = buy_item;
        $scope.origin = {
            callback: function(buy_item_price) {
                $modalInstance.close(buy_item_price);
            }
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
])
.controller('admin.ctrl.dir.barsadminfoodadd',
    ['$scope', '$modal', '$timeout', 'api.models.sellitem', 'api.models.itemdetails', 'api.models.stockitem', 'api.models.buyitem', 'api.models.buyitemprice', 'api.services.action', 'OFF', 'auth.user',
    function($scope, $modal, $timeout, SellItem, ItemDetails, StockItem, BuyItem, BuyItemPrice, APIAction, OFF, user) {
        $scope.user = user;
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
                id_brand: '',
                id_container: '',
                id_container_plural: '',
                id_container_qty: '',
                id_unit: '',
                id_unit_plural: '',
                sti_sell_to_buy: '',
                sei_name: '',
                sei_name_plural: '',
                sei_unit_name: '',
                sei_unit_name_plural: '',
                sei_tax: '',
                keywords: ''
            };
            $scope.data = data;
            $scope.allow_barcode_edit = true;
            $scope.itemInPack = "";
            $scope.oldSellItem = "";
            $timeout(function () {
                document.getElementById("fbarcode").focus();
            }, 300);
        }
        init();
        // Si un barcode est fourni au chargement, on s'en occupe
        data.barcode = $scope.barcode;
        if (data.barcode && data.barcode != "") {
            $scope.allow_barcode_edit = false;
            search(data.barcode);
        }
        // Si un BuyItem est fourni au chargement, on s'en occupe
        if ($scope.buy_item) {
            $scope.allow_barcode_edit = false;
            data.barcode = $scope.buy_item.barcode;
            fillWithBuyItem($scope.buy_item);
        }
        $scope.alerts = [];
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        function resetf() {
            init();
        }

        $scope.new_details = function () {
            return data.bi_details_id == undefined;
        };

        // Rempli data avec ce qui va bien en fonction de buy_item
        function fillWithBuyItem(buy_item) {
            data.bi_id = buy_item.id;
            data.bi_itemqty = buy_item.itemqty;
            data.id_id = buy_item.details.id;
            data.id_name = buy_item.details.name;
            data.id_name_plural = buy_item.details.name_plural;
            data.id_container = buy_item.details.container;
            data.id_container_plural = buy_item.details.container_plural;
            data.id_unit = buy_item.details.unit;
            data.id_unit_plural = buy_item.details.unit_plural;
            data.id_container_qty = buy_item.details.container_qty;
            data.id_brand = buy_item.details.brand;
            $scope.itemInPack = buy_item.details.name;
            // A-t-on besoin de créer le StockItem ?
            var stockItem = _.find(StockItem.all(), function (i) {
                return i.details.id == data.id_id;
            });

            if (buy_item.itemqty != 1) {
                data.is_pack = true;
            } else {
                data.is_pack = false;
            }

            if (data.is_pack && !stockItem) {
                // Il faut trouver le BuyItem lié à l'ItemDetails
                // avec itemqty == 1
                return BuyItem.request({details: data.id_id}).then(function (bids) {
                    var buy_item = _.find(bids, function (f) {
                        return f.itemqty == 1;
                    });
                    if (buy_item) {
                        var modalNewFood = $modal.open({
                            templateUrl: 'components/admin/food/modalAdd.html',
                            controller: 'admin.ctrl.food.addModal',
                            size: 'lg',
                            resolve: {
                                barcode: function () {
                                    return undefined;
                                },
                                buy_item: function () {
                                    return buy_item;
                                }
                            }
                        });
                        modalNewFood.result.then(function (buyItemPrice) {
                            $scope.choiceItemDetail(buyItemPrice);
                            $scope.itemInPack = buyItemPrice.buyitem.details.name;
                        }, function () {

                        });
                    }
                });
            } else if (stockItem) {
                data.sti_id = stockItem.id;
                data.sti_sell_to_buy = stockItem.sell_to_buy;
            }
        }

        // Cherche dans la bdd globale
        // Appelée par search() (basic = false) et par ng-change sur barcode (basic = true)
        function searchGlobal (barcode, basic) {
            if (!barcode) {
                return false;
            }
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
                        fillWithBuyItem(buy_item);
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
                $scope.block = true;
                return true;
            } else {
                data.bi_id = null;
                data.bi_itemqty = '';
                data.id_id = null;
                data.id_name = '';
                data.id_name_plural = '';
                data.id_container = '';
                data.id_container_plural = '';
                data.id_unit = '';
                data.id_unit_plural = '';
                data.id_container_qty = '';
                data.id_brand = '';
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
                            buy_item: function () {
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
                item_details.container = data.id_container;
                item_details.container_plural = data.id_container_plural;
                item_details.container_qty = data.id_container_qty;
                item_details.unit = data.id_unit;
                item_details.unit_plural = data.id_unit_plural;
                item_details.brand = data.id_brand;
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
            function errorSaving() {
                $scope.alerts.push({type: 'danger', msg: "Une erreur s'est produite lors de l'ajout de l'aliment. Veuillez le signaler au Binet Réseau. Celui-ci a probablement été créé a moitié et risque de faire bugguer le site."});
                console.log("Une erreur s'est produite lors de l'enregistrement d'une entité");
                init();
            }
            var nbEnd = 0;
            function entityEnd(nb) {
                if (!nb) {
                    nb = 1;
                }
                nbEnd += nb;
                if (nbEnd == 5) {
                    $scope.alerts.push({type: 'success', msg: "L'aliment a été correctement créé."});
                    $scope.origin.callback(buy_item_price);
                    init();
                }
            }
            function saveBuyItemPrice() {
                buy_item_price.$save().then(function (bip) {
                    buy_item_price = bip;
                    entityEnd();
                }, errorSaving);
            }
            function saveBuyItem() {
                if (!data.bi_id) {
                    buy_item.$save().then(function (bi) {
                        buy_item = bi;
                        buy_item_price.buyitem = bi.id;
                        saveBuyItemPrice();
                        entityEnd();
                    }, errorSaving);
                } else {
                    entityEnd();
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
                        entityEnd();
                    }, errorSaving);
                } else {
                    entityEnd();
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
                        entityEnd();
                    }, errorSaving);
                } else {
                    entityEnd();
                    saveStockItem();
                }
            }
            function saveStockItem() {
                stock_item.$save().then(function (sti) {
                    stock_item = sti;
                    entityEnd();
                }, errorSaving);
            }

            if (data.is_pack) {
                entityEnd(3);
                saveBuyItem();
            } else {
                saveItemDetails();
            }
        };

        $scope.isValid = function () {
            return !$scope.block && data.bip_price &&
                (
                    (data.is_pack // C'est un pack
                        && data.bi_itemqty && data.id_id) ||
                    (!data.is_pack // Ce n'est pas un pack
                        && (
                            (data.new_sell // C'est un nouvel aliment
                                && data.id_name && data.id_name_plural
                                && data.sei_name && data.sei_name_plural && (data.sei_tax === 0 || data.sei_tax > 0)
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
        $scope.$watch('data.id_container', function (newv, oldv) {
            if (data.id_container_plural == oldv) {
                data.id_container_plural = newv;
            }
        });
        $scope.$watch('data.id_unit', function (newv, oldv) {
            if (data.id_unit_plural == oldv) {
                data.id_unit_plural = newv;
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
            buy_item: '=?buyItem',
            origin: '=?origin'
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
                    if (item.qty === 0 || item.qty > 0) {
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
