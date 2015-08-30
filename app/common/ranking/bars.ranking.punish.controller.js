'use strict';

angular.module('bars.granking')
.controller('bars.granking.punish.ctrl',
    ['$scope', 'api.models.bar', 'best_nazis',function($scope, Bar, best_nazis) {
        $scope.Bar = Bar;
        $scope.best_nazis = best_nazis;
    }])
;
