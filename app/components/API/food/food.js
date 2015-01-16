'use strict';

angular.module('bars.api.food', [
    'APIModel'
    ])

.factory('api.models.food', ['APIModel',
    function(APIModel) {
        return new APIModel({
                url: 'item',
                type: "Item",
                structure: {
                    'bar': 'Bar'
                },
                methods: {
                    'markDeleted': {method:'PUT', url: 'markDeleted'},
                    'unMarkDeleted': {method:'PUT', url: 'unMarkDeleted'},
                    'filter': function(s) {
                        return !this.deleted && (this.name.toLocaleLowerCase().indexOf(s) > -1 ||
                            this.keywords.toLocaleLowerCase().indexOf(s) > -1);
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
                food_list: ['api.models.food', function(Food){
                    return Food.all();
                }]
            }
        })
        .state('bar.food.details', {
            url: "/:id",
            templateUrl: "components/API/food/details.html",
            controller: 'api.ctrl.food_details',
            resolve: {
                food_item: ['$stateParams', 'api.models.food', function($stateParams, Food){
                    return Food.getSync($stateParams.id);
                }],
                history: ['api.models.transaction', function(Transaction) {
                    // Transaction.reload();
                    // return Transaction.all();
                }]
            }
        });
}])

.controller('api.ctrl.food',
    ['$scope', function($scope) {
        $scope.bar.active = 'food';
    }])
.controller('api.ctrl.food_list',
    ['$scope', 'food_list', function($scope, food_list) {
        $scope.food_list = food_list;
        $scope.reverse = false;
        $scope.filterDeleted = function() {
            if ($scope.showDeleted) {
                return '';
            } else {
                return {
                    deleted: false
                };
            }
        };
    }])
.controller('api.ctrl.food_details',
    ['$scope', '$stateParams', 'food_item', 'api.services.action', 'bars.meal',
    function($scope, $stateParams, food_item, APIAction, Meal) {
        $scope.food_item = food_item;

        $scope.query_qty = 1;
        $scope.query_type = 'buy';
        $scope.inMeal = function () {
            return Meal.in();
        };
        $scope.query = function(qty, type) {
            if (type == 'buy' || type == 'throw') {
                APIAction[type]({item: $scope.food_item.id, qty: qty*$scope.food_item.unit_value}).then(function() {
                    $scope.query_qty = 1;
                });
            } else if (type == 'appro') {
                APIAction[type]({items: [{item: $scope.food_item.id, qty: qty*$scope.food_item.unit_value}]}).then(function() {
                    $scope.query_qty = 1;
                });
            } else if (type == 'add') {
                Meal.addItem($scope.food_item, qty*$scope.food_item.unit_value);
            }
        };
        $scope.trashIt = function() {
            if ($scope.food_item.deleted) {
                $scope.food_item.unMarkDeleted(); // Todo: adapt to new API
            } else {
                $scope.food_item.markDeleted(); // Todo: adapt to new API
            }
        };

        var initPrice = food_item.price * food_item.unit_value;
        $scope.computeNewPrice = function() {
            if ($scope.newFood_item.unit == food_item.unit) {
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
        };
        $scope.editFood = function() {
            food_item.name = $scope.newFood_item.name;
            food_item.keywords = $scope.newFood_item.keywords;
            food_item.unit = $scope.newFood_item.unit;
            food_item.buy_unit = $scope.newFood_item.buy_unit;
            food_item.price = $scope.newFood_item.price / $scope.newFood_item.new_unit_value / food_item.unit_value;
            food_item.buy_unit_value = $scope.newFood_item.new_buy_unit_value * food_item.buy_unit_value;
            food_item.unit_value = $scope.newFood_item.new_unit_value * food_item.unit_value;
            food_item.$save();
        };
        $scope.resetFood();
    }])

.directive('barsFood', function() {
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
        controller: ['$scope', function($scope) {
            //$scope.unit = $scope.unit || ($scope.food && $scope.food.unit) || '';
            if ($scope.out == 'buy') {
                $scope.unit = $scope.food.buy_unit;
            } else if ($scope.out == 'sell') {
                $scope.unit = $scope.food.unit;
            }
        }]
    };
})
.directive('barsFoodQty', function() {
    return {
        restrict: 'E',
        scope: {
            food: '=food',
            qty: '=qty',
            in: '=?in',
            out: '=?out'
        },
        templateUrl: 'components/API/food/qty-directive.html',
        controller: ['$scope', function($scope) {
            function refresh() {
                $scope.ratio = 1;
                if ($scope.in == 'buy') {
                    $scope.ratio *= $scope.food.buy_unit_value;
                } else if ($scope.in == 'sell') {
                    $scope.ratio *= $scope.food.unit_value;
                }
                if ($scope.out == 'buy') {
                    $scope.ratio *= 1/$scope.food.buy_unit_value;
                    $scope.unit = $scope.food.buy_unit;
                } else if ($scope.out == 'sell') {
                    $scope.ratio *= 1/$scope.food.unit_value;
                    $scope.unit = $scope.food.unit;
                }
            }
            $scope.$watch('food.buy_unit_value', refresh);
            $scope.$watch('food.unit_value', refresh);
            refresh();
        }]
    };
})
.directive('barsFoodPrice', function() {
    return {
        restrict: 'E',
        scope: {
            food: '=food',
            in: '=?in',
            qty: '=?qty'
        },
        templateUrl: 'components/API/food/price-directive.html',
        controller: ['$scope', function($scope) {
            function refresh() {
                if ($scope.in == 'buy') {
                    $scope.price = $scope.food.price * $scope.food.buy_unit_value;
                } else if ($scope.in == 'sell') {
                    $scope.price = $scope.food.price * $scope.food.unit_value;
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
;
