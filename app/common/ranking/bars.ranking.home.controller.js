'use strict';

angular.module('bars.granking')
.controller('bars.granking.home.ctrl',
    ['$scope', 'api.models.bar', 'bars_list', 'best_nazis', 'best_bieres_ever', 'best_bieres_month', 'best_pizzas_ever', function($scope, Bar, bars_list, best_nazis, best_bieres_ever, best_bieres_month, best_pizzas_ever) {
        $scope.Bar = Bar;
        $scope.bars_list = bars_list;
        $scope.best_nazis = best_nazis;
        $scope.best_bieres_ever = best_bieres_ever;
        $scope.best_bieres_month = best_bieres_month;
        $scope.best_pizzas_ever = best_pizzas_ever;
    }])
;
