'use strict';

angular.module('bars.ranking', [
    'APIModel'
    ])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('bar.ranking', {
            url: "/ranking",
            templateUrl: "components/ranking/ranking.html",
            controller: 'ranking.ctrl.ranking',
            resolve: {
                best_ever: ['api.models.account', function(Account) {
                    return Account.ranking({type: ['buy', 'meal']});
                }],
                best_month: ['api.models.account', function(Account) {
                    return Account.ranking({type: ['buy', 'meal'], date_start: moment().subtract(1, 'months').toDate()});
                }],
                best_coheze: ['api.models.account', function(Account) {
                    return Account.ranking({type: 'meal'});
                }],
                best_sellitem_ever: ['bar', function(bar) {
                    return bar.sellitem_ranking({});
                }],
                best_sellitem_week: ['bar', function(bar) {
                    return bar.sellitem_ranking({date_start: moment().subtract(1, 'weeks').toDate()});
                }]
            }
        })
    ;
}])
;
