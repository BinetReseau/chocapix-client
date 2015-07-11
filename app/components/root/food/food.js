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
        .state('root.food.buyitem_edit', {
            url: '/buyitem/:id', 
            templateUrl: 'components/root/food/buyitem_edit.html',
            controller: 'root.ctrl.food.buyitem_edit',
            resolve: {
                buy_item: ['api.models.buyitem', '$stateParams', function(BuyItem, $stateParams) {
                    return BuyItem.getSync($stateParams.id);
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
        $scope.ordre = {
            name: 'name',
            revert: false
        }
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
        function updateBuyItems() {
            BuyItem.request({details: $scope.item.id}).then(function(b) {
                $scope.buyitems = b;
            });
        }
        updateBuyItems();

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

        $scope.deleteBuyItem = function(bi) {
            if (confirm('Cette opération est irréversible. Es-tu sûr de vouloir supprimer cette référence de produit ?')) {
                bi.$delete().then(function() {
                    updateBuyItems();
                });
            }
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

.controller('root.ctrl.food.buyitem_edit',
    ['$scope', 'buy_item', 'api.models.buyitem', '$state', 
    function($scope, buy_item, BuyItem, $state) {
        $scope.buy_item = buy_item;
        $scope.buy_item_bis = _.clone(buy_item);

        $scope.editBI = function() {
            $scope.buy_item.barcode = $scope.buy_item_bis.barcode;
            $scope.buy_item.itemqty = $scope.buy_item_bis.itemqty;
            $scope.buy_item.$save().then(function(bir) {
                $state.go('root.food.details', {id: $scope.buy_item.details.id});
            });
        };
    }]
)
;
