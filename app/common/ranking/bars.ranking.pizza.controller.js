'use strict';

angular.module('bars.granking')
.controller('bars.granking.pizza.ctrl',
    ['$scope', 'best_pizzas_ever', function($scope, best_pizzas_ever) {
        $scope.state.active = 'pizza';
        $scope.best_pizzas_ever = best_pizzas_ever;
    }])
;
