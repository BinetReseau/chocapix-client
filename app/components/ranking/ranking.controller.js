'use strict';

angular.module('bars.ranking')
.controller('ranking.ctrl.ranking',
    ['$scope', 'api.models.account', 'best_ever', 'best_month', 'best_coheze', 'best_sellitem_ever', 'best_sellitem_week', function($scope, Account, best_ever, best_month, best_coheze, best_sellitem_ever, best_sellitem_week) {
        $scope.bar.active = 'ranking';
        $scope.Account = Account;

        $scope.best_ever = best_ever;
        $scope.best_month = best_month;
        $scope.best_coheze = best_coheze;
        $scope.best_sellitem_ever = best_sellitem_ever;
        $scope.best_sellitem_week = best_sellitem_week;

        $scope.state = {active: 'user'};
    }])
;
