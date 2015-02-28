'use strict';

angular.module('bars.api.food', [
    'APIModel'
    ])

.factory('api.models.buyitem', ['APIModel',
    function(APIModel) {
        return new APIModel({
                url: 'buyitem',
                type: 'BuyItem',
                structure: {
                    'details': 'ItemDetails',
                    'buyitemprice': 'BuyItemPrice'
                },
                methods: {
                    'filter': function(s) {
                        return s == this.barcode || this.details.filter(s);
                    }
                }
            });
    }])
.factory('api.models.buyitemprice', ['APIModel',
    function(APIModel) {
        return new APIModel({
                url: 'buyitemprice',
                type: 'BuyItemPrice',
                structure: {
                    'bar': 'Bar',
                    'buyitem': 'BuyItem'
                },
                methods: {
                    'filter': function(s) {
                        return this.buyitem.filter(s);
                    }
                }
            });
    }])
.factory('api.models.itemdetails', ['APIModel',
    function(APIModel) {
        return new APIModel({
                url: 'itemdetails',
                type: "ItemDetails",
                structure: {
                    'stockitem': 'StockItem'
                },
                methods: {
                    'filter': function(s) {
                        return (
                            _.deburr(this.name.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1 ||
                            _.deburr(this.keywords.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1
                            );
                    }
                }
            });
    }])
.factory('api.models.stockitem', ['APIModel',
    function(APIModel) {
        return new APIModel({
                url: 'stockitem',
                type: 'StockItem',
                structure: {
                    'bar': 'Bar',
                    'details': 'ItemDetails',
                    'sellitem': 'SellItem'
                },
                methods: {
                    'filter': function(s) {
                        return !this.deleted && this.details.filter(s);
                    }
                }
            });
    }])
.factory('api.models.sellitem', ['APIModel',
    function(APIModel) {
        return new APIModel({
                url: 'sellitem',
                type: 'SellItem',
                structure: {
                    'bar': 'Bar',
                    'stockitems.*': 'StockItem'
                },
                methods: {
                    'filter': function(s) {
                        var all_keywords = "";
                        _.forEach(this.stockitems, function(n, i) { all_keywords = all_keywords + " " + n.details.keywords; });
                        var searchable = this.name + " " + all_keywords;
                        return (_.deburr(searchable.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1);
                    }
                }
            });
    }])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('bar.food', {
            url: "/food",
            abstract: true,
            template: '<ui-view/>',
            controller: 'api.ctrl.food'
        })
        .state('bar.food.list', {
            url: "/list",
            templateUrl: "components/API/food/list.html",
            controller: 'api.ctrl.food_list',
            resolve: {
                food_list: ['api.models.sellitem', function(SellItem) {
                    return SellItem.all();
                }]
            }
        })
        .state('bar.food.details', {
            url: "/:id",
            //templateUrl: "components/API/food/details.html",
            controller: 'api.ctrl.food_details',
            resolve: {
                food_item: ['$stateParams', 'api.models.sellitem', function($stateParams, SellItem) {
                    return SellItem.getSync($stateParams.id);
                }],
                sellitem_list: ['api.models.sellitem', function(SellItem) {
                    return SellItem.all();
                }]
            },
            views: {
                '@bar.food': {
                    templateUrl: "components/API/food/views/details.html",
                    controller: 'api.ctrl.food_details'
                },
                'infos@bar.food.details': {
                    templateUrl: "components/API/food/views/details-infos.html",
                    controller: 'api.ctrl.food_details'
                },
                'stocks@bar.food.details': {
                    templateUrl: "components/API/food/views/details-stocks.html",
                    controller: 'api.ctrl.food_details.stocks',
                },
                'edit@bar.food.details': {
                    templateUrl: "components/API/food/views/details-edit.html",
                    controller: 'api.ctrl.food_details.edit'
                }
            }
        });
}])

.controller('api.ctrl.food',
    ['$scope',
    function($scope) {
        $scope.bar.active = 'food';
    }]
)
.controller('api.ctrl.food_list',
    ['$scope', 'food_list',
    function($scope, food_list) {
        $scope.food_list = food_list;
        console.log(food_list);
        $scope.searchl = "";
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
    }]
)
.controller('api.ctrl.food_details',
    ['$scope', '$stateParams', 'food_item', 'auth.user', 'api.models.buyitemprice', 'api.services.action', 'bars.meal',
    function($scope, $stateParams, food_item, AuthUser, BuyItemPrice, APIAction, Meal) {
        $scope.food_item = food_item;
        $scope.actions = [];
        if (AuthUser.can('add_buytransaction')) {
            $scope.actions.push({ name: "buy", value: "Acheter" });
        }
        if (AuthUser.can('add_throwtransaction')) {
            $scope.actions.push({ name: "throw", value: "Jeter" });
        }
        if (AuthUser.can('add_mealtransaction')) {
            $scope.actions.push({ name: "add", value: "Ajouter à la bouffe" });
        }
        if (AuthUser.can('add_approtransaction')) {
            $scope.actions.push({ name: "appro", value: "Approvisionner" });
        }
        var item_details = _.map(food_item.stockitems, function (si) {
            return si.details.id;
        });
        $scope.buy_item_prices = _.filter(BuyItemPrice.all(), function (bip) {
            return item_details.indexOf(bip.buyitem.details.id) > -1;
        });

        $scope.query = {
            qty: 1,
            type: Meal.in() && 'add' || 'buy',
            stockitem: $scope.food_item.stockitems[0],
            buyitemprice: $scope.buy_item_prices[0]
        };
        $scope.inMeal = function () {
            return Meal.in();
        };
        $scope.queryProcess = function(qty, type) {
            if (type == 'buy') {
                APIAction[type]({sellitem: $scope.food_item.id, qty: qty}).then(function() {
                    $scope.query.qty = 1;
                });
            } else if (type == 'throw') { // TODO : gérer la qty
                APIAction[type]({stockitem: $scope.query.stockitem.id, qty: qty}).then(function() {
                    $scope.query.qty = 1;
                })
            } else if (type == 'appro') { // TODO : gérer la qty
                APIAction[type]({items: [{buyitem: $scope.query.buyitemprice.buyitem.id, qty: qty}]}).then(function() {
                    $scope.query.qty = 1;
                });
            } else if (type == 'add') {
                Meal.addItem($scope.food_item, qty);
            }
        };

    }]
)
.controller('api.ctrl.food_details.stocks',
    ['$scope', '$stateParams', '$modal', 'food_item', 'auth.user', 'api.services.action', 'sellitem_list', 'APIInterface',
    function($scope, $stateParams, $modal, food_item, AuthUser, APIAction, sellitem_list, APIInterface){
        sellitem_list = _.without(sellitem_list, food_item);
        $scope.removeStockItem = function(si) {
            APIInterface.request({
                'url': 'sellitem/' + food_item.id + '/remove',
                'method': 'PUT',
                'data': {'stockitem': si.id}
            }).then(function(si) {
                food_item.$reload();
            });
        };
        $scope.rattachInit = function() {
            var modalAttach = $modal.open({
                templateUrl: 'components/API/food/views/modal-add-sellitem.html',
                resolve: {
                    food_item: function() {
                        return food_item;
                    },
                    sellitem_list: function() {
                        return sellitem_list;
                    }
                },
                controller: ['$scope', '$modalInstance', 'food_item', 'sellitem_list', function ($scope, $modalInstance, food_item, sellitem_list) {
                    $scope.sellitem_list = sellitem_list;
                    $scope.food_item = food_item;
                    $scope.searchl = "";
                    $scope.itemToAttach = null;
                    $scope.filterItems = function(o) {
                        return o.filter($scope.searchl);
                    };
                    $scope.addItem = function(item) {
                        $scope.itemToAttach = item;
                        $scope.itemToAttach.unit_factor = 1;
                    };
                    $scope.validate = function() {
                        APIInterface.request({
                            'url': 'sellitem/' + food_item.id + '/merge',
                            'method': 'PUT',
                            'data': {'sellitem': $scope.itemToAttach.id, 'unit_factor': 1/$scope.itemToAttach.unit_factor}
                        }).then(function(si) {
                            food_item.$reload();
                        });
                        $modalInstance.close();
                    };
                }],
                size: 'lg'
            });
        };

    }]
)
.controller('api.ctrl.food_details.edit',
    ['$scope', '$stateParams', 'food_item', 'auth.user', 'api.services.action',
    function($scope, $stateParams, food_item, AuthUser, APIAction) {
        $scope.toggleDeleted = function() {
            $scope.food_item.deleted = !$scope.food_item.deleted;
            $scope.food_item.$save();
        };

        var initPrice = food_item.fuzzy_price;
        $scope.computeNewPrice = function() {
            var tempPrice = food_item.fuzzy_price * (1 + $scope.newFood_item.tax/100) / (1 + food_item.tax);
            if ($scope.newFood_item.unit_name == food_item.unit_name) {
                $scope.newFood_item.fuzzy_price = tempPrice;
            } else {
                if ($scope.newFood_item.unit_factor) {
                    $scope.newFood_item.fuzzy_price = tempPrice * $scope.newFood_item.unit_factor;
                    $scope.newFood_item.fuzzy_qty = food_item.fuzzy_qty / $scope.newFood_item.unit_factor;
                } else {
                    $scope.newFood_item.fuzzy_price = tempPrice;
                }
            }
        };
        $scope.resetFood = function() {
            $scope.newFood_item = _.clone(food_item);
            $scope.newFood_item.fuzzy_price = initPrice;
            $scope.newFood_item.unit_factor = 1;
            $scope.newFood_item.tax *= 100;
        };
        $scope.editFood = function() {
            food_item.unit_name_plural = $scope.newFood_item.unit_name_plural;
            food_item.unit_name = $scope.newFood_item.unit_name;
            food_item.name = $scope.newFood_item.name;
            food_item.name_plural = $scope.newFood_item.name_plural;
            food_item.tax = $scope.newFood_item.tax/100;
            food_item.unit_factor = 1/$scope.newFood_item.unit_factor;
            food_item.$save();
        };
        $scope.resetFood();
    }]
)

/*.controller('api.ctrl.dir.barsfood',
    ['$scope', function($scope) {
        function refresh() {
            $scope.ratio = 1;
            if ($scope.in == 'buy') {
                $scope.ratio *= $scope.food.details.unit_value;
            } else if ($scope.in == 'sell') {
                $scope.ratio *= $scope.food.unit_value;
            }
            if ($scope.out == 'buy') {
                $scope.ratio *= 1/$scope.food.details.unit_value;
                $scope.unit_name = $scope.food.details.unit_name;
                $scope.unit_name_plural = $scope.food.details.unit_name_plural;
            } else if ($scope.out == 'sell') {
                $scope.ratio *= 1/$scope.food.unit_value;
                $scope.unit_name = $scope.food.unit_name;
                $scope.unit_name_plural = $scope.food.unit_name_plural;
            }
        }
        $scope.abs = Math.abs;
        $scope.$watch('food.buy_unit_value', refresh);
        $scope.$watch('food.unit_value', refresh);
        refresh();
    }])
.directive('barsFood', function() { // TO BE REMOVED
    return {
        restrict: 'E',
        scope: {
            food: '=food',
            //unit: '=?unit',
            qty: '=?qty',
            in: '=?in',
            out: '=?out'
        },
        templateUrl: 'components/API/food/directive.html',
        controller: 'api.ctrl.dir.barsfood'
    };
})
.directive('barsFoodQty', function() { // TO BE REMOVED
    return {
        restrict: 'E',
        scope: {
            food: '=food',
            qty: '=qty',
            in: '=?in',
            out: '=?out'
        },
        templateUrl: 'components/API/food/qty-directive.html',
        controller: 'api.ctrl.dir.barsfood'
    };
})
.directive('barsFoodPrice', function() { // TO BE REMOVED
    return {
        restrict: 'E',
        scope: {
            food: '=food',
            in: '=?in',
            qty: '=?qty',
            tax: '=?tax'
        },
        templateUrl: 'components/API/food/price-directive.html',
        controller: ['$scope', function($scope) {
            function refresh() {
                if ($scope.in == 'buy') {
                    $scope.price = $scope.food.price * $scope.food.buy_unit_value;
                } else if ($scope.in == 'sell') {
                    $scope.price = $scope.food.price * $scope.food.unit_value;
                    if ($scope.tax) {
                        $scope.price *= (1+$scope.food.tax);
                    }
                } else {
                    $scope.price = $scope.food.price;
                }
            }
            $scope.$watch('food.buy_unit_value', refresh);
            $scope.$watch('food.unit_value', refresh);
            refresh();
        }]
    };
})*/
.controller('api.ctrl.dir.barssellitem',
    ['$scope', function($scope) {
        function refresh() {
            $scope.unit_name = $scope.item.unit_name;
            $scope.unit_name_plural = $scope.item.unit_name_plural;
        }
        $scope.abs = Math.abs;
        refresh();
        $scope.$watch('item.unit_name', refresh);
        $scope.$watch('item.unit_name_plural', refresh);
    }])
.directive('barsSellitem', function() {
    return {
        restrict: 'E',
        scope: {
            item: '=item',
            //unit: '=?unit',
            qty: '=?qty'
        },
        templateUrl: 'components/API/food/directives/sellitem-directive.html',
        controller: 'api.ctrl.dir.barssellitem'
    };
})
.directive('barsSellitemQty', function() {
    return {
        restrict: 'E',
        scope: {
            item: '=item',
            qty: '=qty'
        },
        templateUrl: 'components/API/food/directives/sellitem-qty-directive.html',
        controller: 'api.ctrl.dir.barssellitem'
    };
})
.directive('barsSellitemPrice', function() {
    return {
        restrict: 'E',
        scope: {
            item: '=item',
            qty: '=?qty',
            tax: '=?tax'
        },
        templateUrl: 'components/API/food/directives/sellitem-price-directive.html',
        controller: ['$scope', function($scope) {
            function refresh() {
                $scope.price = $scope.item.fuzzy_price;
                $scope.unit_name = $scope.item.unit_name;
            }
            $scope.$watch('item.unit_name', refresh);
            $scope.$watch('item.fuzzy_price', refresh);
            refresh();
        }]
    };
})
.controller('api.ctrl.dir.barsstockitem',
    ['$scope', function($scope) {
        function refresh() {
            $scope.ratio = 1;
            if ($scope.out == 'buy') {
                $scope.ratio *= $scope.item.sell_to_buy;
                $scope.unit_name = $scope.item.details.name;
                $scope.unit_name_plural = $scope.item.details.name_plural;
            } else {
                $scope.unit_name = $scope.item.sellitem.unit_name;
                $scope.unit_name_plural = $scope.item.sellitem.unit_name_plural;
            }
        }
        $scope.abs = Math.abs;
        $scope.$watch('item.sell_to_buy', refresh);
        //$scope.$watch('item.sellitem.unit_value', refresh);
        refresh();
    }])
.directive('barsStockitem', function() {
    return {
        restrict: 'E',
        scope: {
            item: '=item',
            //unit: '=?unit',
            qty: '=?qty',
            out: '=?out'
        },
        templateUrl: 'components/API/food/directives/stockitem-directive.html',
        controller: 'api.ctrl.dir.barsstockitem'
    };
})
.directive('barsStockitemQty', function() {
    return {
        restrict: 'E',
        scope: {
            item: '=item',
            qty: '=qty',
            out: '=?out'
        },
        templateUrl: 'components/API/food/directives/stockitem-qty-directive.html',
        controller: 'api.ctrl.dir.barsstockitem'
    };
})
.directive('barsStockitemPrice', function() {
    return {
        restrict: 'E',
        scope: {
            item: '=item',
            qty: '=?qty'
        },
        templateUrl: 'components/API/food/directives/stockitem-price-directive.html',
        controller: ['$scope', function($scope) {
            function refresh() {
                $scope.price = $scope.item.price * (1 + $scope.item.sellitem.tax);
                $scope.unit_name = $scope.item.sellitem.unit_name;
            }
            refresh();
        }]
    };
})
;
