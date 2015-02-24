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
                    'details': 'ItemDetails'
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

                },
                methods: {
                    'filter': function(s) {
                        return (_.deburr(this.name.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1 ||
                            _.deburr(this.keywords.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1);
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
            templateUrl: "components/API/food/details.html",
            controller: 'api.ctrl.food_details',
            resolve: {
                food_item: ['$stateParams', 'api.models.sellitem', function($stateParams, SellItem) {
                    return SellItem.getSync($stateParams.id);
                }]
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
    ['$scope', '$stateParams', 'food_item', 'auth.user', 'api.services.action', 'bars.meal',
    function($scope, $stateParams, food_item, AuthUser, APIAction, Meal) {
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

        $scope.query = {
            qty: 1,
            type: Meal.in() && 'add' || 'buy',
            stockitem: $scope.food_item.stockitems[0]
        };
        $scope.inMeal = function () {
            return Meal.in();
        };
        $scope.queryProcess = function(qty, type) {
            if (type == 'buy') {
                APIAction[type]({sellitem: $scope.food_item.id, qty: qty*$scope.food_item.unit_value}).then(function() {
                    $scope.query.qty = 1;
                });
            } else if (type == 'throw') {
                APIAction[type]({stockitem: $scope.query.stockitem.id, qty: qty*$scope.query.stockitem.details.unit_value}).then(function() {
                    $scope.query.qty = 1;
                })
            } else if (type == 'appro') {
                APIAction[type]({items: [{stockitem: $scope.query.stockitem.id, qty: qty*$scope.query.stockitem.details.unit_value}]}).then(function() {
                    $scope.query.qty = 1;
                });
            } else if (type == 'add') {
                Meal.addItem($scope.food_item, qty*$scope.food_item.unit_value);
            }
        };
        $scope.toggleDeleted = function() {
            $scope.food_item.deleted = !$scope.food_item.deleted;
            $scope.food_item.$save();
        };

        var initPrice = food_item.price * food_item.unit_value;
        $scope.computeNewPrice = function() {
            if ($scope.newFood_item.unit_name == food_item.unit_name) {
                $scope.newFood_item.price = initPrice;
            } else {
                if ($scope.newFood_item.new_unit_value) {
                    $scope.newFood_item.price = initPrice * $scope.newFood_item.new_unit_value;
                } else {
                    $scope.newFood_item.price = initPrice;
                }
            }
        };
        $scope.resetFood = function() {
            $scope.newFood_item = _.clone(food_item);
            $scope.newFood_item.price = initPrice;
            $scope.newFood_item.new_unit_value = 1;
            $scope.newFood_item.new_buy_unit_value = 1;
            $scope.newFood_item.tax *= 100;
        };
        $scope.editFood = function() {
            food_item.unit_name_plural = $scope.newFood_item.unit_name_plural;
            food_item.unit_name = $scope.newFood_item.unit_name;
            food_item.price = $scope.newFood_item.price / $scope.newFood_item.new_unit_value / food_item.unit_value;
            food_item.buy_price = $scope.newFood_item.buy_price / $scope.food_item.details.unit_value;
            food_item.unit_value = $scope.newFood_item.new_unit_value * food_item.unit_value;
            food_item.tax = $scope.newFood_item.tax/100;
            food_item.$save();
        };
        $scope.resetFood();
    }])

.controller('api.ctrl.dir.barsfood',
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
})
.controller('api.ctrl.dir.barssellitem',
    ['$scope', function($scope) {
        function refresh() {
            $scope.ratio = 1;
            if ($scope.in == 'sell') {
                $scope.ratio *= $scope.item.unit_value;
            }
            if ($scope.out == 'sell') {
                $scope.ratio *= 1/$scope.item.unit_value;
                $scope.unit_name = $scope.item.unit_name;
                $scope.unit_name_plural = $scope.item.unit_name_plural;
            }
        }
        $scope.abs = Math.abs;
        $scope.$watch('item.unit_value', refresh);
        refresh();
    }])
.directive('barsSellitem', function() {
    return {
        restrict: 'E',
        scope: {
            item: '=item',
            //unit: '=?unit',
            qty: '=?qty',
            in: '=?in',
            out: '=?out'
        },
        templateUrl: 'components/API/food/directives/sellitem.html',
        controller: 'api.ctrl.dir.barssellitem'
    };
})
.directive('barsSellitemQty', function() {
    return {
        restrict: 'E',
        scope: {
            item: '=item',
            qty: '=qty',
            in: '=?in',
            out: '=?out'
        },
        templateUrl: 'components/API/food/directives/qty-directive.html',
        controller: 'api.ctrl.dir.barssellitem'
    };
})
.directive('barsSellitemPrice', function() {
    return {
        restrict: 'E',
        scope: {
            item: '=item',
            in: '=?in',
            qty: '=?qty',
            tax: '=?tax'
        },
        templateUrl: 'components/API/food/directives/price-directive.html',
        controller: ['$scope', function($scope) {
            function refresh() {
                if ($scope.in == 'sell') {
                    $scope.price = $scope.item.price * $scope.item.unit_value;
                    if ($scope.tax) {
                        $scope.price *= (1+$scope.item.tax);
                    }
                } else {
                    $scope.price = $scope.item.price;
                }
            }
            $scope.$watch('item.unit_value', refresh);
            refresh();
        }]
    };
})
.controller('api.ctrl.dir.barsstockitem',
    ['$scope', function($scope) {
        function refresh() {
            $scope.ratio = 1;
            if ($scope.in == 'buy') {
                $scope.ratio *= $scope.item.details.unit_value;
            } else if ($scope.in == 'sell') {
                $scope.ratio *= $scope.item.sellitem.unit_value;
            }
            if ($scope.out == 'buy') {
                $scope.ratio *= 1/$scope.item.details.unit_value;
                $scope.unit_name = $scope.item.details.unit_name;
                $scope.unit_name_plural = $scope.item.details.unit_name_plural;
            } else if ($scope.out == 'sell') {
                $scope.ratio *= 1/$scope.item.sellitem.unit_value;
                $scope.unit_name = $scope.item.sellitem.unit_name;
                $scope.unit_name_plural = $scope.item.sellitem.unit_name_plural;
            }
        }
        $scope.abs = Math.abs;
        $scope.$watch('item.details.unit_value', refresh);
        $scope.$watch('item.sellitem.unit_value', refresh);
        refresh();
    }])
.directive('barsStockitem', function() {
    return {
        restrict: 'E',
        scope: {
            item: '=item',
            //unit: '=?unit',
            qty: '=?qty',
            in: '=?in',
            out: '=?out'
        },
        templateUrl: 'components/API/food/directives/stockitem.html',
        controller: 'api.ctrl.dir.barsstockitem'
    };
})
.directive('barsStockitemQty', function() {
    return {
        restrict: 'E',
        scope: {
            item: '=item',
            qty: '=qty',
            in: '=?in',
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
            in: '=?in',
            qty: '=?qty',
            tax: '=?tax'
        },
        templateUrl: 'components/API/food/directives/stockitem-price-directive.html',
        controller: ['$scope', function($scope) {
            function refresh() {
                if ($scope.in == 'buy') {
                    $scope.price = $scope.item.price * $scope.item.details.unit_value;
                } else if ($scope.in == 'sell') {
                    $scope.price = $scope.item.price * $scope.item.sellitem.unit_value;
                } else {
                    $scope.price = $scope.item.price;
                }
            }
            $scope.$watch('item.details.unit_value', refresh);
            $scope.$watch('item.sellitem.unit_value', refresh);
            refresh();
        }]
    };
})
;
