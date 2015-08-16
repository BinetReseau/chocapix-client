'use strict';

angular.module('bars.ranking')
.directive('barsRankingAccounts', function() {
    return {
        restrict: 'EA',
        scope: {
            ranking: '=ranking'
        },
        templateUrl: 'components/ranking/directives/ranking-accounts.directive.html',
        controller: ['$scope', 'api.models.account', function ($scope, Account) {
            $scope.Account = Account;
        }]
    };
})
;
