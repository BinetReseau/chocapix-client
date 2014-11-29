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
                    'cancel': {method:'POST', url: 'cancel'},
                    'restore': {method:'POST', url: 'restore'}
                },
                hooks: {
                    'add': function() {
                        if(this.account) {
                            this.account.$reload();
                        }
                        if(this.item) {
                            this.item.$reload();
                        }
                    }
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
                return transaction.$save();
            };
        });
        return Action;
    }])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('bar.history', {
            url: "/history",
            templateUrl: "components/API/transaction/list.html",
            resolve: {
                history: ['api.models.transaction', '$stateParams',
                    function(Transaction) {
                        return Transaction.all();
                }]
            },
            controller: ['$scope', 'history',
                function($scope, history) {
                    $scope.bar.active = 'history';
                    $scope.history = history;
            }]
        });
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
            function parseTimestamp(transaction) {
                transaction.timestamp = new Date(transaction.timestamp);
                transaction.timestamp_day = new Date(transaction.timestamp.getFullYear(), transaction.timestamp.getMonth(), transaction.timestamp.getDate());
            }
            function initList() {
                $scope.history.forEach(parseTimestamp);
                $scope.history_by_date = _.groupBy($scope.history, 'timestamp_day');
                $scope.history_dates = _.keys($scope.history_by_date);
                $scope.history_dates = _.map($scope.history_dates, function(x){return { date: new Date(x) }; });
                console.log($scope.history_dates);
            }
            initList();

            $scope.$on('api.model.transaction.add', initList);
            $scope.$on('api.model.transaction.update', function(evt, transaction) {
                parseTimestamp(transaction);
            });
            $scope.$on('api.model.transaction.remove', initList);
            $scope.$on('api.model.transaction.clear', initList);
            // $scope.$watchCollection('history', function(){
            //     initList(); // Todo: use model events instead
            // });
        }]
    };
})
;
