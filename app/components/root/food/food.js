'use strict';

angular.module('bars.root.food', [

])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('root.food', {
        abstract: true,
        url: "/food",
        template: "<ui-view />",
        controller: ['$scope', function($scope) {
            $scope.root.active = 'food';
            $scope.ordre = {name: 'name', revert: false};
        }]
    })
        .state('root.food.base', {
            url: '/home',
            templateUrl: "components/root/food/home.html",
            controller: 'root.ctrl.food.base'
        })
        .state('root.food.details', {
            url: '/:id',
            templateUrl: "components/root/food/details.html",
            controller: 'root.ctrl.food.details',
            resolve: {
                item: ['api.models.itemdetails', '$stateParams', function(ItemDetails, $stateParams) {
                    return ItemDetails.getSync($stateParams.id);
                }]
            }
        })
    ;
}])

.controller('root.ctrl.food.base',
    ['$scope', 'itemdetails_list', '$state',
    function($scope, itemdetails_list, $state){
        $scope.itemdetails_list = itemdetails_list;
        $scope.searchl = '';
        $scope.filterItems = function(o) {
            return o.filter($scope.searchl);
        };
        $scope.findItem = function(item) {
            $state.go('root.food.details', {id: item.id});
        };
    }]
)

.controller('root.ctrl.food.details',
    ['$scope', 'item', 'api.models.itemdetails', 'api.models.buyitem', 
    function($scope, item, ItemDetails, BuyItem){
        $scope.item = item;
        $scope.itemBis = _.clone($scope.item);
        BuyItem.request({details: $scope.item.id}).then(function(b) {
            $scope.buyitems = b;
        });

        $scope.hasChanged = function() {
            return !angular.equals($scope.item, $scope.itemBis);
        };

        $scope.saveItem = function() {
            $scope.item.name = $scope.itemBis.name;
            $scope.item.name_plural = $scope.itemBis.name_plural;
            $scope.item.brand = $scope.itemBis.brand;
            $scope.item.container = $scope.itemBis.container;
            $scope.item.container_plural = $scope.itemBis.container_plural;
            $scope.item.unit = $scope.itemBis.unit;
            $scope.item.unit_plural = $scope.itemBis.unit_plural;
            $scope.item.container_qty = $scope.itemBis.container_qty;
            $scope.item.keywords = $scope.itemBis.keywords;
            $scope.item.$save().then(function(i) {
                $scope.item = i;
                $scope.itemBis = _.clone(i);
            });
        };

        $scope.$watch('itemBis.name', function (newv, oldv) {
            if ($scope.itemBis.name_plural == oldv) {
                $scope.itemBis.name_plural = newv;
            }
        });
        $scope.$watch('itemBis.container', function (newv, oldv) {
            if ($scope.itemBis.container_plural == oldv) {
                $scope.itemBis.container_plural = newv;
            }
        });
        $scope.$watch('itemBis.unit', function (newv, oldv) {
            if ($scope.itemBis.unit_plural == oldv) {
                $scope.itemBis.unit_plural = newv;
            }
        });
    }]
)
;
