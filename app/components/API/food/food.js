'use strict';

angular.module('bars.api.food', [])
.controller(
    'FoodDetailCtrl',
    ['$scope', '$stateParams', 'API.Action', 'foodDetails', 'foodHistory',
    function($scope, $stateParams, APIAction, foodDetails, foodHistory) {
        $scope.foodDetails = foodDetails;
        $scope.history = foodHistory;
        $scope.queryQty = 1;
        $scope.queryType = 'buy';
        $scope.query = function(qty, type) {
            if (type == 'buy' || type == 'throw' || type == 'appro') {
                APIAction[type]({item: $scope.foodDetails.id, qty: qty}).then(function() {
                    $scope.queryQty = 1;
                });
            }
        };
        $scope.trashIt = function() {
            if ($scope.foodDetails.deleted) {
                $scope.foodDetails.unMarkDeleted(); // Todo: adapt to new API
            } else {
                $scope.foodDetails.markDeleted(); // Todo: adapt to new API
            }
        };
    }])
.controller('FoodListCtrl',
    ['$scope', function($scope) {
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
.controller('FoodCtrl',
    ['$scope', function($scope) {
        $scope.bar.active = 'food';
    }])
.directive('barsFood', function() {
    return {
        restrict: 'E',
        scope: {
            food: '=food',
            unit: '=?unit',
            qty: '=?qty'
        },
        templateUrl: 'components/API/food/bars-food.html',
        controller: ['$scope', function($scope) {
            $scope.unit = $scope.unit || ($scope.food && $scope.food.unit) || '';
        }]
    };
})
;
