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
                    'unMarkDeleted': {method:'PUT', url: 'unMarkDeleted'}
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
                food_item_history: ['$stateParams', 'API.Transaction', function($stateParams, Transaction) {
                    // TODO: return Transaction.byItem({id: $stateParams.id});
                    return Transaction.all();
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
    ['$scope', '$stateParams', 'food_item', 'food_item_history', 'API.Action',
    function($scope, $stateParams, food_item, food_item_history, APIAction) {
        $scope.food_item = food_item;
        $scope.food_item_history = food_item_history;
        $scope.query_qty = 1;
        $scope.query_type = 'buy';
        $scope.query = function(qty, type) {
            if (type == 'buy' || type == 'throw' || type == 'appro') {
                APIAction[type]({item: $scope.food_item.id, qty: qty}).then(function() {
                    $scope.query_qty = 1;
                });
            }
        };
        $scope.trashIt = function() {
            if ($scope.food_item.deleted) {
                $scope.food_item.unMarkDeleted(); // Todo: adapt to new API
            } else {
                $scope.food_item.markDeleted(); // Todo: adapt to new API
            }
        };
    }])

.directive('barsFood', function() {
    return {
        restrict: 'E',
        scope: {
            food: '=food',
            unit: '=?unit',
            qty: '=?qty'
        },
        templateUrl: 'components/API/food/directive.html',
        controller: ['$scope', function($scope) {
            $scope.unit = $scope.unit || ($scope.food && $scope.food.unit) || '';
        }]
    };
})
;
