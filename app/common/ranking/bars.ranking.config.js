'use strict';

angular.module('bars.granking', [])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('ranking', {
            url: "/ranking",
            templateUrl: "common/ranking/ranking.html",
            controller: 'bars.granking.ctrl',
            resolve: {
                bars_list: ['api.models.bar', 'api.models.barsettings', function(Bar, BarSettings) {
                    Bar.clear();
                    return Bar.reload();
                }],
                best_nazis: ['api.models.bar', function(Bar) {
                    return Bar.nazi_ranking({});
                }]
            }
        })
    ;
}])
;
