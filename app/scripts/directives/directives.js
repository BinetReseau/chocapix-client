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
        controller: ['$scope', function($scope) {
            $scope.unit = $scope.unit || ($scope.food && $scope.food.unit) || '';
        }]
    };
})
.directive('barsAccount', function() {
    return {
        restrict: 'E',
        scope: {
            account: '=account',
            useri: "=?user"
        },
        templateUrl: 'scripts/directives/views/bars-account.html',
        controller: ['$scope', function($scope) {
            $scope.user = function() {
                return $scope.useri || ($scope.account && $scope.account.user) || null;
            };
        }]
    };
})
.directive('barsHistory', function() {
    return {
        restrict: 'E',
        scope: {
            history: '=history',
            updateCallback: "=?update"
        },
        templateUrl: 'scripts/directives/views/bars-history.html',
        controller: ['$scope', 'API.Transaction',
            function($scope, Transaction) {
                $scope.canUpdate = !!$scope.updateCallback;
                $scope.update = function() {
                    if($scope.canUpdate){
                        $scope.updating = true;
                        return $scope.updateCallback().then(function(){
                            $scope.updating = false;
                        });
                    }
                };
                $scope.cancelTransaction = function(t) {
                    return Transaction.cancel({id: t.id}, null).$promise.then(function(){
                        $scope.update();
                    });
                };
        }]
    };
});
