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
                    'filter': function(s) {
                        return !this.deleted && !this.unavailable && (_.deburr(this.name.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1 ||
                            _.deburr(this.keywords.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1);
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
                food_list: ['api.models.food', function(Food) {
                    return Food.all();
                }]
            }
        })
        .state('bar.food.details', {
            url: "/:id",
            templateUrl: "components/API/food/details.html",
            controller: 'api.ctrl.food_details',
            resolve: {
                food_item: ['$stateParams', 'api.models.food', function($stateParams, Food) {
                    return Food.getSync($stateParams.id);
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
        $scope.filterHidden = function() {
            if ($scope.showHidden) {
                return '';
            } else {
                return {
                    unavailable: false
                };
            }
        };
    }])
.controller('api.ctrl.food_details',
    ['$scope', '$stateParams', 'food_item', 'api.services.action', 'bars.meal', 'auth.user',
    function($scope, $stateParams, food_item, APIAction, Meal, AuthUser) {
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

        $scope.query_qty = 1;
        $scope.query_type = Meal.in() && 'add' || 'buy';
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
        $scope.toggleDeleted = function() {
            $scope.food_item.deleted = !$scope.food_item.deleted;
            $scope.food_item.$save();
        };
        $scope.toggleHidden = function() {
            $scope.food_item.unavailable = !$scope.food_item.unavailable;
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
        };
        $scope.editFood = function() {
            food_item.name = $scope.newFood_item.name;
            food_item.keywords = $scope.newFood_item.keywords;
            food_item.unit_name = $scope.newFood_item.unit_name;
            food_item.buy_unit_name = $scope.newFood_item.buy_unit_name;
            food_item.price = $scope.newFood_item.price / $scope.newFood_item.new_unit_value / food_item.unit_value;
            food_item.buy_unit_value = $scope.newFood_item.new_buy_unit_value * food_item.buy_unit_value;
            food_item.unit_value = $scope.newFood_item.new_unit_value * food_item.unit_value;
            food_item.$save();
        };
        $scope.resetFood();
    }])

.controller('api.ctrl.dir.barsfood',
    ['$scope', function($scope) {
        function refresh() {
            $scope.ratio = 1;
            if ($scope.in == 'buy') {
                $scope.ratio *= $scope.food.buy_unit_value;
            } else if ($scope.in == 'sell') {
                $scope.ratio *= $scope.food.unit_value;
            }
            if ($scope.out == 'buy') {
                $scope.ratio *= 1/$scope.food.buy_unit_value;
                $scope.unit_name = $scope.food.buy_unit_name;
                $scope.unit_name_plural = $scope.food.buy_unit_name_plural;
            } else if ($scope.out == 'sell') {
                $scope.ratio *= 1/$scope.food.unit_value;
                $scope.unit_name = $scope.food.unit_name;
                $scope.unit_name_plural = $scope.food.unit_name_plural;
            }
        }
        $scope.$watch('food.buy_unit_value', refresh);
        $scope.$watch('food.unit_value', refresh);
        refresh();
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
        controller: 'api.ctrl.dir.barsfood'
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
        controller: 'api.ctrl.dir.barsfood'
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
