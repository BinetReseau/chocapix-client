'use strict';

angular.module('bars.api.food', [
    'APIModel'
    ])

.factory('api.models.food',
    ['APIModel', 'API',
    function(APIModel, API) {
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
            controller: 'api.ctrl.food',
            resolve: {
                food_items: ['api.models.food', '$stateParams', function(Food, $stateParams){
                    return Food.all();
                }]
            }
        })
        .state('bar.food.list', {
            url: "/list",
            templateUrl: "components/API/food/list.html",
            controller: 'api.ctrl.food_list'
        })
        .state('bar.food.details', {
            url: "/:id",
            templateUrl: "components/API/food/details.html",
            controller: 'api.ctrl.food_detail',
            resolve: {
                item_details: ['api.models.food', '$stateParams', function(Food, $stateParams){
                    return Food.getSync($stateParams.id);
                }],
                item_history: ['API.Transaction', '$stateParams', function(Transaction, $stateParams) {
                    // return Transaction.byItem({id: $stateParams.id});
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
    ['$scope', 'food_items', function($scope, food_items) {
        $scope.food_items = food_items;
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
.controller('api.ctrl.food_detail',
    ['$scope', '$stateParams', 'API.Action', 'item_details', 'item_history',
    function($scope, $stateParams, APIAction, item_details, item_history) {
        $scope.item_details = item_details;
        $scope.item_history = item_history;
        $scope.queryQty = 1;
        $scope.queryType = 'buy';
        $scope.query = function(qty, type) {
            if (type == 'buy' || type == 'throw' || type == 'appro') {
                APIAction[type]({item: $scope.item_details.id, qty: qty}).then(function() {
                    $scope.queryQty = 1;
                });
            }
        };
        $scope.trashIt = function() {
            if ($scope.item_details.deleted) {
                $scope.item_details.unMarkDeleted(); // Todo: adapt to new API
            } else {
                $scope.item_details.markDeleted(); // Todo: adapt to new API
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
