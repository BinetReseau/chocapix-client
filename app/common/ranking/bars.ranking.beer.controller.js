'use strict';

angular.module('bars.granking')
.controller('bars.granking.beer.ctrl',
    ['$scope', 'best_bieres_ever', 'best_bieres_month',function($scope, best_bieres_ever, best_bieres_month) {
        $scope.state.active = 'beer';
        $scope.best_bieres_ever = best_bieres_ever;
        $scope.best_bieres_month = best_bieres_month;
    }])
;
