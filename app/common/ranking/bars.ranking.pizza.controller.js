'use strict';

angular.module('bars.granking')
.controller('bars.granking.pizza.ctrl',
    ['$scope', 'api.models.bar', 'best_pizzas_ever', function($scope, Bar, best_pizzas_ever) {
        $scope.Bar = Bar;

        $scope.best_pizzas_ever = best_pizzas_ever;
    }])
;
