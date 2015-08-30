'use strict';

angular.module('bars.granking')
.controller('bars.granking.ctrl',
    ['$scope', '$rootScope', 'api.models.bar', function($scope, $rootScope, Bar) {
        $rootScope.appLoaded = true;
        $scope.nbDays = moment().diff(moment("2015-04-01"), 'days');
        $scope.promoOfBar = function (bar) {
            if (bar.match(/jone$/)) {
                return 'warning';
            } else {
                return 'danger';
            }
        };
        $scope.Bar = Bar;
        $scope.state = {active: null};
    }])
;
