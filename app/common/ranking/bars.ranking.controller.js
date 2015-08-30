'use strict';

angular.module('bars.granking')
.controller('bars.granking.ctrl',
    ['$scope', '$rootScope', function($scope, $rootScope) {
        $rootScope.appLoaded = true;
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
