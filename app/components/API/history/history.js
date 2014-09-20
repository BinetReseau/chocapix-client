'use strict';

angular.module('bars.ctrl.history', [
    ])
.controller('HistoryCtrl',
    ['$scope', '$filter', 'api.models.transaction', 'history',
        function($scope, $filter, Transaction, history) {
            $scope.bar.active = 'history';
            $scope.history = history;

    }
])
;
