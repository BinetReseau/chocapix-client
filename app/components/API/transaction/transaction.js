'use strict';

angular.module('bars.api.transaction', [
    'APIModel'
    ])

.factory('api.models.transaction', ['APIModel',
    function(APIModel) {
        function parseTimestamp(t) {
            var ts = new Date(t.timestamp);
            t.timestamp = ts;
            t.timestamp_day = new Date(ts.getFullYear(), ts.getMonth(), ts.getDate());
        }
        return new APIModel({
                url: 'transaction',
                type: "Transaction",
                structure: {
                    'bar': 'Bar',
                    'author': 'User',
                    'author_account': 'Account',
                    'account': 'Account',
                    // 'accounts.account': 'Account',
                    'item': 'Item',
                    // 'items.item': 'Item'
                },
                methods: {
                    'cancel': {method:'POST', url: 'cancel'},
                    'restore': {method:'POST', url: 'restore'}
                },
                hooks: {
                    'add': function() {
                        if(this.author_account) {
                            this.author_account.$reload();
                        }
                        if(this.account) {
                            this.account.$reload();
                        }
                        if(this.item) {
                            this.item.$reload();
                        }
                        parseTimestamp(this);
                    },
                    'update': function(o) {
                        parseTimestamp(this);
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
                        Transaction.reload();
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
            filter: '&filter'
        },
        templateUrl: 'components/API/transaction/directive.html',
        controller: ['$scope', 'api.models.transaction', function($scope, Transaction) {
            function updateList() {
                var history = _.filter(Transaction.all(), $scope.filter);
                $scope.history_by_date = _.groupBy(history, 'timestamp_day');
                $scope.history_dates = _.keys($scope.history_by_date);
                $scope.history_dates = _.map($scope.history_dates, function(x){return { date: new Date(x) }; });
            }
            updateList();
            $scope.$on('api.model.transaction.*', updateList);
        }]
    };
})
;
