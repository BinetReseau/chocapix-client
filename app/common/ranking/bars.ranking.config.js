'use strict';

angular.module('bars.granking', ['bars.filters'])
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
                }],
                best_bieres_ever: ['api.models.bar', function(Bar) {
                    return Bar.items_ranking({date_start: moment("2015-04-01").toDate(), item:[2, 3, 1, 5, 6, 558, 4, 7, 1334, 1024, 1584, 697, 696, 1249, 1247, 1248, 1250, 1251, 340, 3754, 1602, 3236, 747, 1405, 1787, 1788, 3810, 418, 1392, 2596, 3472, 1330, 2495, 2598, 340, 1517, 558, 2597, 1586, 2494, 3230, 2493, 1300, 1284, 966, 809, 2596, 2194, 2778, 1582, 963]});
                }],
                best_bieres_month: ['api.models.bar', function(Bar) {
                    return Bar.items_ranking({date_start: moment().subtract(1, 'months').toDate(), item:[2, 3, 1, 5, 6, 558, 4, 7, 1334, 1024, 1584, 697, 696, 1249, 1247, 1248, 1250, 1251, 340, 3754, 1602, 3236, 747, 1405, 1787, 1788, 3810, 418, 1392, 2596, 3472, 1330, 2495, 2598, 340, 1517, 558, 2597, 1586, 2494, 3230, 2493, 1300, 1284, 966, 809, 2596, 2194, 2778, 1582, 963]});
                }]
            }
        })
    ;
}])
;
