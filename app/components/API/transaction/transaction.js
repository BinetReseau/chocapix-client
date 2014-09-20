'use strict';

angular.module('bars.api.transaction', [
    'APIModel'
    ])

.factory('api.models.transaction', ['APIModel',
    function(APIModel) {
        return new APIModel({
                url: 'transaction',
                type: "Transaction",
                structure: {
                    'bar': 'Bar',
                    'author': 'User',
                    'account': 'Account',
                    'item': 'Item'
                },
                methods: {
                }
            });
    }])

.factory('api.services.action', ['api.models.transaction',
    function(Transaction) {
        var actions = ["buy", "give", "throw", "punish", "appro"];
        var Action = {};
        actions.forEach(function(action) {
            Action[action] = function(params) {
                var transaction = Transaction.create(params);
                transaction.type = action;
                // _.extend(transaction, params);
                return transaction.$save();
            };
        });
        return Action;
    }])

.directive('barsHistory', function() {
    return {
        restrict: 'E',
        scope: {
            history: '=history'
        },
        templateUrl: 'components/API/transaction/directive.html',
        controller: ['$scope', function($scope) {
            // Todo: calculate date object on creation
            var initList = function(newValue, oldValue) {
                $scope.history.forEach(function(transaction) {
                    transaction.timestamp = new Date(transaction.timestamp);
                    transaction.timestamp_day = new Date(transaction.timestamp.getFullYear(), transaction.timestamp.getMonth(), transaction.timestamp.getDate());
                });
                $scope.history_by_date = _.groupBy($scope.history, 'timestamp_day');
                $scope.history_dates = _.keys($scope.history_by_date).reverse();
                $scope.history_dates = _.map($scope.history_dates, function(x){return new Date(x);});
            };
            $scope.$watchCollection('history', function(){
                initList(); // Todo: use model events instead
            });

            $scope.cancelTransaction = function(t) {
                t.cancel(); // Todo: adapt to new API
            };
            $scope.uncancelTransaction = function(t) {
                t.uncancel(); // Todo: adapt to new API
            };
        }]
    };
})
;
