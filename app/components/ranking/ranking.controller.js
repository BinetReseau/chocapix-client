'use strict';

angular.module('bars.ranking')
.controller('ranking.ctrl.ranking',
    ['$scope', 'api.models.account', 'best_ever', 'best_month', 'best_coheze', 'best_sellitem', function($scope, Account, best_ever, best_month, best_coheze, best_sellitem) {
        $scope.bar.active = 'ranking';
        $scope.Account = Account;

        $scope.best_ever = best_ever;
        $scope.best_month = best_month;
        $scope.best_coheze = best_coheze;
        $scope.best_sellitem = best_sellitem;

        $scope.state = {active: 'user'};
    }])
;
