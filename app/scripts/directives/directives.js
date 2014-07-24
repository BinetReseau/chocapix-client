'use strict';

angular.module('bars.directives', [
    'bars.events'
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
            var setUser = function(newValue, oldValue) {
                $scope.user = $scope.useri || ($scope.account && $scope.account.user) || null;
            };
            setUser();

            $scope.$watch('useri', setUser);
            $scope.$watch('account', setUser);
        }]
    };
})

.directive('barsHistory', function() {
    return {
        restrict: 'E',
        scope: {
            history: '=history'
        },
        templateUrl: 'scripts/directives/views/bars-history.html',
        controller: ['$scope', '$events',
            function($scope, $events) {
                $scope.canUpdate = true;
                $scope.update = function() {
                    $scope.updating = true;
                    $scope.history.$reload().$promise.then(function(o){
                        $scope.updating = false;
                    });
                };
                $scope.$on('bars.transaction.add', $scope.update);
                $scope.cancelTransaction = function(t) {
                    t.cancel().$promise.then(function(t){
                        $events.$broadcast('bars.transaction.update', t);
                    });
                };
        }]
    };
});
