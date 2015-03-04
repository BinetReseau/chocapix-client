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
                    'items.*.stockitem': 'StockItem',
                    'items.*.sellitem': 'SellItem',
                    'stockitem': 'StockItem'
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
                            'method': 'PUT',
                            'data': self})
                        .then(function(t) {
                            self.canceled = t.canceled;
                            self.reloadRelated();
                        })
                        .catch(function(e) {
                            self.canceled = false;
                            console.log("Permission denied (probably)"); //TODO: notifications
                        });
                    },
                    'restore': function() {
                        var self = this;
                        self.canceled = false;
                        APIInterface.request({
                            'url': "transaction/"+self.id+"/restore",
                            'method': 'PUT',
                            'data': self})
                        .then(function(t) {
                            self.canceled = t.canceled;
                            self.reloadRelated();
                        })
                        .catch(function(e) {
                            self.canceled = true;
                            console.log("Permission denied (probably)"); //TODO: notifications
                        });
                    },
                    'reloadRelated': function() {
                        if(this.author_account) {
                            this.author_account.$reload();
                        }
                        if(this.account) {
                            this.account.$reload();
                        }
                        if(this.accounts) {
                            _.forEach(this.accounts, function(x) {
                                x.account.$reload();
                            });
                        }
                        if(this.stockitem) {
                            this.stockitem.$reload();
                        }
                        if(this.sellitem) {
                            this.sellitem.$reload();
                        }
                        if(this.items) {
                            _.forEach(this.items, function(x) {
                                if (x.sellitem) {
                                    x.sellitem.$reload();
                                    _.forEach(x.sellitem.stockitems, function (s) {
                                        s.$reload();
                                    });
                                }
                                if (x.stockitem) {
                                    x.stockitem.$reload();
                                    x.stockitem.sellitem.$reload();
                                }
                            });
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
        var actions = ["buy", "throw", "give", "punish", "meal", "appro", "inventory", "deposit", "collectivePayment", "refund", "withdraw", "barInvestment"];
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
            abstract: true,
            templateUrl: "components/API/transaction/layout.html",
            controller: ['$scope',
                function($scope) {
                    $scope.bar.active = 'history';
                    $scope.state = {active: ''};
            }]
        })
            .state('bar.history.all', {
                url: "/all",
                templateUrl: "components/API/transaction/list.html",
                controller: ['$scope',
                    function($scope) {
                        $scope.state.active = 'all';
                        $scope.history = history;
                }]
            })
            .state('bar.history.appro', {
                url: "/appro",
                templateUrl: "components/API/transaction/appro-history.html",
                controller: ['$scope',
                    function($scope) {
                        $scope.state.active = 'appro';
                        $scope.history = history;
                }]
            })
            .state('bar.history.inventory', {
                url: "/inventory",
                templateUrl: "components/API/transaction/inventory-history.html",
                controller: ['$scope',
                    function($scope) {
                        $scope.state.active = 'inventory';
                        $scope.history = history;
                }]
            })
        ;
}])

.directive('barsHistory', function() {
    return {
        restrict: 'E',
        scope: {
            filter: '&filter',
            sellitem: "=?sellitem",
            buyInStock: '=?buyInStock', // false: display buytransaction with sellitems ; true: display buytransaction with stockitem
            dailyTotal: '=?dailyTotal' // true: display total price by day
            // limitTo: '=?limit' // no more limit, infinite scroll everywhere
        },
        templateUrl: 'components/API/transaction/directive.html',
        controller: ['$scope', '$filter', '$sanitize', 'api.models.transaction', function($scope, $filter, $sanitize, Transaction) {
            $scope.history = [];
            var allHistory = [];
            var page = 1;
            var inRequest = false;
            function loadMore() {
                if (!inRequest) {
                    inRequest = true;
                    var req = $scope.filter();
                    req.page = page++;
                    req.page_size = 30;
                    if ($scope.sellitem) {
                        req.sellitem = $scope.sellitem;
                    }
                    Transaction.request(req).then(function(history) {
                        allHistory = allHistory.concat(history);
                        calculateHistory();
                    });
                }
            }
            function calculateHistory(event, transaction) {
                if ($scope.dailyTotal) {
                    if ($scope.filter().user) {
                        var fuser = $scope.filter().user;
                    }
                }
                if (transaction) {
                    allHistory.unshift(transaction);
                }

                allHistory = _.uniq(allHistory, "id");

                _.forEach(allHistory, function(t) {
                    t.parseTimestamp();
                });
                var history_by_date = _.groupBy(allHistory, 'timestamp_day');
                var history_dates = _.keys(history_by_date);
                history_dates = _.map(history_dates, function(x){return { date: new Date(x) }; });
                for (var i = 0; i < history_dates.length; i++) {
                    history_dates[i].history = history_by_date[history_dates[i].date];
                    if (fuser) {
                        history_dates[i].totalMoney = _.reduce(history_dates[i].history, function (sum, t) {
                            if (t.canceled) {
                                return sum;
                            }
                            if (t.type == 'buy') {
                                return sum + t.moneyflow;
                            } else if (t.type == 'punish' && t.account.owner.id == fuser) {
                                return sum - t.moneyflow;
                            } else if (t.type == 'give') {
                                if (t.account.owner.id == fuser) {
                                    return sum;
                                } else {
                                    return sum + t.moneyflow;
                                }
                            } else if (t.type == 'meal' || t.type == 'collectivePayment') {
                                return sum + (t.moneyflow*_.result(_.find(t.accounts, function (a) {
                                    return a.account.owner.id == fuser;
                                }), 'ratio') || 0);
                            }
                            return sum;
                        }, 0);
                    }
                }
                $scope.history = history_dates;
                inRequest = false;
            }

            if ($scope.buyInStock) {
                $scope.sellOrStock = {sellitem: undefined};
            } else {
                $scope.sellOrStock = {stockitem: undefined};
            }
            //$scope.sellOrStock = {};

            $scope.safe = $sanitize;
            $scope.loadMore = loadMore;

            loadMore();

            $scope.$on('api.model.transaction.add', calculateHistory);
            $scope.$on('auth.hasLoggedIn', function () {
                allHistory = [];
                page = 1;
                loadMore();
            });
        }]
    };
})
;
