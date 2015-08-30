'use strict';

angular.module('bars.ranking')
.directive('barsRankingSellitems', function() {
    return {
        restrict: 'EA',
        scope: {
            ranking: '=ranking',
            limit: '=?limit'
        },
        templateUrl: 'components/ranking/directives/ranking-sellitems.directive.html',
        controller: ['$scope', 'api.models.sellitem', function ($scope, SellItem) {
            $scope.SellItem = SellItem;
            $scope.abs = Math.abs;
            if (!$scope.limit) {
                $scope.limit = 999999;
            }
        }]
    };
})
;
