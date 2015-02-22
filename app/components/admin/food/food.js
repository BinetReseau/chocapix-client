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
    ['$scope', 'api.models.food', 'api.models.fooddetails', 'api.services.action',
    function($scope, Food, FoodDetails, APIAction) {
        $scope.food = Food.create();
        $scope.food_details = FoodDetails.create();
        $scope.food.bar = $scope.bar.id;
        var add = {};
        $scope.add = add;
        $scope.addFood = function() {
            var qty = $scope.food.qty/$scope.food.unit_value;
            add.go().then(function(newFood) {
                APIAction.appro({
                    items: [{item: newFood.id, qty: qty}]
                });
            }, function(errors) {
                // TODO: display form errors
            });
        };
    }
])
.controller('admin.ctrl.food.appro',
    ['$scope', '$modal', 'api.models.food', 'admin.appro',
    function($scope, $modal, Food, Appro) {
        $scope.appro = Appro;

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
    ['$scope', 'api.models.food', 'api.models.fooddetails', 'api.services.action', 'OFF',
    function($scope, Food, FoodDetails, APIAction, OFF) {
        var initDetails = $scope.food_details;
        $scope.barcode = $scope.food_details.barcode;

        $scope.add.go = function() {
            $scope.food_details.unit_value = 1;
            $scope.food.qty = 0;
            $scope.food.unit_value = 1/$scope.food.unit_value;
            $scope.food.tax *= 0.01;
            function saveFood(foodDetails) {
                $scope.food.details = foodDetails.id;
                $scope.food.buy_price = $scope.food.price;
                return $scope.food.$save().then(function(newFood) {
                    $scope.food = Food.create();
                    $scope.food_details = FoodDetails.create();
                    $scope.barcode = "";
                    return newFood;
                }, function(errors) {
                    // TODO: display form errors
                });
            }

            if ($scope.new_details) {
                $scope.food_details.barcode = $scope.barcode;
                return $scope.food_details.$save().then(saveFood, function(errors) {
                    // TODO: display form errors
                });
            } else {
                return saveFood($scope.food_details);
            }
        };
        $scope.searchDetails = function (barcode) {
            $scope.allow_barcode_edit = true;
            var food_details = _.filter(FoodDetails.all(), function (f) {
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
                    $scope.food_details.name = infos.name;
                    $scope.food_details.name_plural = infos.name_plural;
                    $scope.food_details.unit_name = infos.unit;
                    $scope.food_details.unit_name_plural = infos.unit_plural;
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

        $scope.$watch('food_details.name', function (newv, oldv) {
            if ($scope.food_details.name_plural == oldv) {
                $scope.food_details.name_plural = newv;
            }
        });
        $scope.$watch('food.unit_name', function (newv, oldv) {
            if ($scope.food.unit_name_plural == oldv) {
                $scope.food.unit_name_plural = newv;
            }
        });
        $scope.$watch('food_details.unit_name', function (newv, oldv) {
            if ($scope.food_details.unit_name_plural == oldv) {
                $scope.food_details.unit_name_plural = newv;
            }
        });
    }
])
.directive('barsAdminFoodAdd', function() {
    return {
        restrict: 'E',
        scope: {
            food: '=food',
            food_details: '=foodDetails',
            add: '=add',
            new_details: '=?newDetails'
        },
        templateUrl: 'components/admin/food/formFood.html',
        controller: 'admin.ctrl.dir.barsadminfoodadd'
    };
})
.controller('admin.ctrl.food.inventory',
    ['$scope', 'api.models.food', 'admin.inventory',
    function($scope, Food, Inventory) {
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
    ['api.models.food', 'api.services.action',
    function (Food, APIAction) {
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
                    // totalPrice += item.item.price * item.qty * item.unit_value;
                    if (item.qty && item.qty > 0 && item.price && item.unit_value) {
                        item.price = item.price * item.qty * item.unit_value/(item.old_qty * item.old_unit_value);
                        item.old_qty = item.qty;
                        item.old_unit_value = item.unit_value;
                    }
                    totalPrice += item.price;
                });

                this.totalPrice = totalPrice;
            },
            addItem: function(item, qty) {
                if (!qty) {
                    qty = item.details.unit_value;
                }
                var other = _.find(this.itemsList, {'item': item});
                if (other) {
                    other.qty += qty/item.details.unit_value;
                    other.nb = nb++;
                } else {
                    this.itemsList.push({
                        item: item,
                        qty: qty/item.details.unit_value,
                        old_qty: qty/item.details.unit_value,
                        unit_value: item.details.unit_value,
                        old_unit_value: item.details.unit_value,
                        price: item.buy_price * qty * item.details.unit_value,
                        nb: nb++});
                }
                this.recomputeAmount();
                console.log(item);
                this.itemToAdd = "";
            },
            removeItem: function(item) {
                this.itemsList.splice(this.itemsList.indexOf(item), 1);
                this.recomputeAmount();
            },
            validate: function() {
                this.inRequest = true;
                _.forEach(this.itemsList, function(item, i) {
                    item.qty = item.qty * item.unit_value;
                    item.buy_price = item.price / (item.qty);
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
    ['api.models.food', 'api.services.action',
    function (Food, APIAction) {
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
