'use strict';

angular.module('bars.directives', [
    ])
.directive('barsFood', function() {
    return {
        restrict: 'E',
        scope: {
            food: '=food',
            unit: '=?unit',
            qty: '=?qty'
        },
        templateUrl: 'scripts/directives/views/bars-food.html',
        controller: function($scope) {
            $scope.unit = $scope.unit || ($scope.food && $scope.food.unit) || '';
        }
    };
})
.directive('barsAccount', function() {
    return {
        restrict: 'E',
        scope: {
            account: '=account',
            user: "=?user"
        },
        templateUrl: 'scripts/directives/views/bars-account.html',
        controller: function($scope) {
            $scope.user = $scope.user || ($scope.account && $scope.account.user) || null;
        }
    };
});
