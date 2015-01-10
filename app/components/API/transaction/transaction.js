'use strict';

angular.module('bars.api.transaction', [
    'APIModel'
    ])

.factory('api.models.transaction', ['APIModel', 'APIInterface',
    function(APIModel, APIInterface) {
        var model = new APIModel({
                url: 'transaction',
                type: "Transaction",
                structure: {
                    'bar': 'Bar',
                    'author': 'User',
                    'author_account': 'Account',
                    'account': 'Account',
                    'accounts.*.account': 'Account',
                    'item': 'Item',
                    'items.*.item': 'Item'
                },
                methods: {
                    'parseTimestamp':  function() {
                        var ts = new Date(this.timestamp);
                        this.timestamp = ts;
                        this.timestamp_day = new Date(ts.getFullYear(), ts.getMonth(), ts.getDate());
                    },
                    'cancel': function() {
                        var self = this;
                        self.canceled = true;
                        APIInterface.request({
                            'url': "transaction/"+self.id+"/cancel",
                            'method': 'POST',
                            'data': self})
                        .then(function(t) {
                            self.canceled = t.canceled;
                            self.reloadRelated();
                        })
                    },
                    'restore': function() {
                        var self = this;
                        self.canceled = false;
                        APIInterface.request({
                            'url': "transaction/"+self.id+"/restore",
                            'method': 'POST',
                            'data': self})
                        .then(function(t) {
                            self.canceled = t.canceled;
                            self.reloadRelated();
                        })
                    },
                    'reloadRelated': function() {
                        if(this.author_account) {
                            this.author_account.$reload();
                        }
                        if(this.account) {
                            this.account.$reload();
                        }
                        if(this.item) {
                            this.item.$reload();
                        }
                        this.parseTimestamp();
                    }
                }
            });
        model.request = function(params) {
            return APIInterface.request({
                'url': 'transaction',
                'method': 'GET',
                'params': params});
        }
        return model;
    }])
.factory('api.services.action', ['api.models.transaction',
    function(Transaction) {
        var actions = ["buy", "meal", "give", "throw", "punish", "appro"];
        var Action = {};
        actions.forEach(function(action) {
            Action[action] = function(params) {
                var transaction = Transaction.create(params);
                transaction.type = action;
                return transaction.$save().then(function(t) {
                        t.reloadRelated();
                        return t;
                    });
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
                        // Transaction.reload();
                        // return Transaction.all();
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
            filter: '&filter',
            limitTo: '=?limit'
        },
        templateUrl: 'components/API/transaction/directive.html',
        controller: ['$scope', '$filter', 'api.models.transaction', function($scope, $filter, Transaction) {
            function updateList() {
                var req = $scope.filter;
                req.page = 1;
                Transaction.request(req).then(function(history){
                    _.forEach(history, function(t){
                        t.parseTimestamp();
                    });
                    if ($scope.limitTo !== undefined) {
                        history = $filter('limitTo')(history, -$scope.limitTo);
                    }
                    $scope.history_by_date = _.groupBy(history, 'timestamp_day');
                    $scope.history_dates = _.keys($scope.history_by_date);
                    $scope.history_dates = _.map($scope.history_dates, function(x){return { date: new Date(x) }; });
                })
            }
            updateList();
            $scope.$on('api.model.transaction.*', updateList);
            $scope.$on('auth.hasLoggedIn', updateList);
        }]
    };
})
;
