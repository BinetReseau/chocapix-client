'use strict';

angular.module('bars.granking')
.controller('bars.granking.ctrl',
    ['$scope', '$rootScope', 'api.models.bar', 'bars_list', 'best_nazis', function($scope, $rootScope, Bar, bars_list, best_nazis) {
        $rootScope.appLoaded = true;

        $scope.Bar = Bar;
        $scope.bars_list = bars_list;
        $scope.best_nazis = best_nazis;
    }])
;
