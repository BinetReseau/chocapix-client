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
                    return Bar.nazi_ranking({date_start: moment("2015-04-01").toDate()});
                }],
                best_bieres_ever: ['api.models.bar', 'ranking.items', function(Bar, RankingItems) {
                    return Bar.items_ranking({date_start: moment("2015-04-01").toDate(), item: RankingItems.beer});
                }],
                best_bieres_month: ['api.models.bar', 'ranking.items', function(Bar, RankingItems) {
                    return Bar.items_ranking({date_start: moment().subtract(1, 'months').toDate(), item: RankingItems.beer});
                }],
                best_pizzas_ever: ['api.models.bar', 'ranking.items', function(Bar, RankingItems) {
                    return Bar.items_ranking({date_start: moment("2015-04-01").toDate(), item: RankingItems.pizza});
                }],
            }
        })
    ;
}])
;
