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
            var setUser = function(newValue, oldValue) {
                $scope.user = $scope.useri || ($scope.account && $scope.account.user) || null;
            };
            setUser();

            $scope.$watch('user', setUser);
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
        controller: ['$scope',
            function($scope) {
                $scope.canUpdate = true;
                $scope.update = function() {
                    $scope.updating = true;
                    $scope.history.$reload().$promise.then(function(o){
                        $scope.history = o;
                        $scope.updating = false;
                    });
                };
                $scope.cancelTransaction = function(t) {
                    t.cancel().$promise.then(function(){
                        $scope.update();
                    });
                };
        }]
    };
});
