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
.directive('barsHistory', function() {
    return {
        restrict: 'E',
        scope: {
            history: '=history'
        },
        templateUrl: 'components/API/history/bars-history.html',
        controller: ['$scope',
            function($scope) {
                var prepareDisplay = function(newValue, oldValue) {
                    $scope.historyDisplay = {};
                    var i = 0;
                    var dayCurrent = new Date("2013-01-01");
                    $scope.history.forEach(function(h) {
                        h.timestamp = new Date(h.timestamp);
                        if (h.timestamp.toDateString() == dayCurrent.toDateString()) {
                            $scope.historyDisplay[i].history.push(h);
                        } else {
                            dayCurrent = new Date(h.timestamp.toDateString());
                            i++;
                            $scope.historyDisplay[i] = {
                                date: dayCurrent,
                                history: [h]
                            };
                        }
                    });
                };
                $scope.$watch('history.$loading', function(loading){
                    if(!loading)
                        prepareDisplay();
                });
                // if($scope.history.$promise)
                //     $scope.history.$promise.then(function(){
                //         prepareDisplay();
                //     });
                // else
                //     prepareDisplay();

                $scope.canUpdate = true;
                $scope.update = function() {
                    $scope.history.$reload().$promise.then(function(o){
                        // prepareDisplay();
                    });
                };
                $scope.cancelTransaction = function(t) {
                    t.cancel(); // Todo: adapt to new API
                };
                $scope.uncancelTransaction = function(t) {
                    t.uncancel(); // Todo: adapt to new API
                };
            }
        ]
    };
})
;
