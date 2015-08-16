'use strict';

angular.module('bars.ranking')
.controller('ranking.ctrl.ranking',
    ['$scope', 'api.models.account', 'best_ever', 'best_month', 'best_coheze', function($scope, Account, best_ever, best_month, best_coheze) {
        $scope.bar.active = 'ranking';
        $scope.Account = Account;

        $scope.best_ever = best_ever;
        $scope.best_month = best_month;
        $scope.best_coheze = best_coheze;
    }])
;
