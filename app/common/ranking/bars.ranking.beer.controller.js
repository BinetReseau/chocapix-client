'use strict';

angular.module('bars.granking')
.controller('bars.granking.beer.ctrl',
    ['$scope', 'api.models.bar', 'best_bieres_ever', 'best_bieres_month',function($scope, Bar, best_bieres_ever, best_bieres_month) {
        $scope.Bar = Bar;

        $scope.best_bieres_ever = best_bieres_ever;
        $scope.best_bieres_month = best_bieres_month;
    }])
;
