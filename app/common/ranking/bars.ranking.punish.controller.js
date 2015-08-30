'use strict';

angular.module('bars.granking')
.controller('bars.granking.punish.ctrl',
    ['$scope', 'best_nazis',function($scope, best_nazis) {
        $scope.state.active = 'punish';
        $scope.best_nazis = best_nazis;
    }])
;
