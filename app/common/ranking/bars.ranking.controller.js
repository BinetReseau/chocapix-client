'use strict';

angular.module('bars.granking')
.controller('bars.granking.ctrl',
    ['$scope', '$rootScope', 'api.models.bar', 'bars_list', 'best_nazis', 'best_bieres_ever', 'best_bieres_month', function($scope, $rootScope, Bar, bars_list, best_nazis, best_bieres_ever, best_bieres_month) {
        $rootScope.appLoaded = true;

        $scope.Bar = Bar;
        $scope.bars_list = bars_list;
        $scope.best_nazis = best_nazis;
        $scope.best_bieres_ever = best_bieres_ever;
        $scope.best_bieres_month = best_bieres_month;

        $scope.nbDays = moment().diff(moment("2015-04-01"), 'days');

        $scope.promoOfBar = function (bar) {
            if (bar.match(/jone$/)) {
                return 'warning';
            } else {
                return 'danger';
            }
        };
    }])
;
