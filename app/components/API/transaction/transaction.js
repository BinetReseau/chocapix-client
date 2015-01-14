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
        var actions = ["buy", "throw", "give", "punish", "meal", "appro", "inventory"];
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
            // limitTo: '=?limit' // no more limit, infinite scroll everywhere
        },
        templateUrl: 'components/API/transaction/directive.html',
        controller: ['$scope', '$filter', '$sanitize', 'api.models.transaction', function($scope, $filter, $sanitize, Transaction) {
            function loadList(index, count, success) {
                // no negative index
                if (index < 0) {
                    success([]);
                    return;
                }
                var req = $scope.filter();
                req.page = Math.ceil(index/count);
                req.page_size = count;
                Transaction.request(req).then(function(history) {
                    var endHistory = (history.length < count);

                    _.forEach(history, function(t){
                        t.parseTimestamp();
                    });
                    var history_by_date = _.groupBy(history, 'timestamp_day');
                    var history_dates = _.keys(history_by_date);
                    history_dates = _.map(history_dates, function(x){return { date: new Date(x) }; });

                    // if it is not the end, success(array) wants array.length == count.
                    // But we groupBy day, so the next part is a trick to add empty
                    // items to history_dates which are not displayed
                    var realLength = history_dates.length;
                    for (var i = 0; i < count; i++) {
                        if (i < realLength) {
                            history_dates[i].display = true;
                            history_dates[i].history = history_by_date[history_dates[i].date];
                        } else if (!endHistory) {
                            history_dates[i] = {
                                display: false
                            };
                        }
                    }

                    success(history_dates);
                })
            }

            var needUpdate = true;
            function update() {
                needUpdate = true;
            }

            $scope.history_dates = {
                get: loadList,
                revision:  function () {
                    var current = needUpdate;
                    needUpdate = false;
                    return current;
                }
            };
            $scope.safe = $sanitize;

            $scope.$on('api.model.transaction.*', update);
            $scope.$on('auth.hasLoggedIn', update);
        }]
    };
})
;
