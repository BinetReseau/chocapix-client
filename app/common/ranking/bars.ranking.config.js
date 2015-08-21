'use strict';

angular.module('bars.granking', [])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('ranking', {
            url: "/ranking",
            templateUrl: "common/ranking/ranking.html",
            controller: 'bars.granking.ctrl',
            resolve: {

            }
        })
    ;
}])
;
