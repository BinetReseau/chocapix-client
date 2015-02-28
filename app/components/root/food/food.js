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
    ['$scope', 'item', 'api.models.itemdetails', 
    function($scope, item, ItemDetails){
        $scope.item = item;
        $scope.itemBis = _.clone($scope.item);

        $scope.saveItem = function() {
            $scope.item.name = $scope.itemBis.name;
            $scope.item.name_plural = $scope.itemBis.name_plural;
            $scope.item.$save().then(function(i) {
                $scope.item = i;
                $scope.itemBis = _.clone(i);
            });
        };
    }]
)
;
