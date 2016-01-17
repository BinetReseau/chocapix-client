'use strict';

angular.module('bars.admin', [
    'bars.admin.food',
    'bars.admin.account',
    'bars.admin.news',
    'bars.admin.compta',
    'bars.admin.settings',
    'bars.admin.suggesteditem',
])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('bar.admin', {
        url: "/admin",
        views: {
            '@bar': {
                templateUrl: "components/admin/layout.html",
                controller: 'admin.ctrl.base'
            },
            '@bar.admin': {
                templateUrl: "components/admin/dashboard.html",
                controller: 'admin.ctrl.home',
                resolve: {
                    account_list: ['api.models.account', function(Account) {
                        return Account.all();
                    }],
                    stockitem_list: ['api.models.stockitem', function(StockItem) {
                        return StockItem.all();
                    }],
                    bar_account: ['api.models.account', function(Account) {
                        return Account.ofUser(6);
                    }]
                }
            }
        }
    });
}])

.controller('admin.ctrl.base',
    ['$scope',
    function($scope) {
        $scope.bar.active = 'admin';
        $scope.admin = {
            active: ''
        };
    }
])
.controller('admin.ctrl.home',
    ['$scope', 'account_list', 'stockitem_list', 'bar_account', 'bar',
    function($scope, account_list, stockitem_list, bar_account, bar) {
        $scope.admin.active = 'dashboard';
        new Morris.Line({
            // ID of the element in which to draw the chart.
            element: 'graph1',
            // Chart data records -- each entry in this array corresponds to a point on
            // the chart.
            data: [
            { year: '2008', value: 20 },
            { year: '2009', value: 10 },
            { year: '2010', value: 5 },
            { year: '2011', value: 5 },
            { year: '2012', value: 20 }
            ],
            // The name of the data record attribute that contains x-values.
            xkey: 'year',
            // A list of names of data record attributes that contain y-values.
            ykeys: ['value'],
            // Labels for the ykeys -- will be displayed when you hover over the
            // chart.
            labels: ['Value'],
            smooth: false
        });

        $scope.nbAccountNegativ = _.filter(account_list, function (o) {
            return o.money <= 0 && !o.deleted && o.owner.is_active;
        }).length;
        $scope.ratioAccountNegativ = $scope.nbAccountNegativ/account_list.length;

        $scope.nbFoodNegativ = _.filter(stockitem_list, function (o) {
            return o.qty <= 0;
        }).length;
        $scope.ratioFoodNegativ = $scope.nbFoodNegativ/stockitem_list.length;

        var foodValue = _.reduce(stockitem_list, function (total, f) {
            if (!f.deleted) {
                total += f.qty * f.price;
            }
            return total;
        }, 0);
        var accountsValue = _.reduce(account_list, function (total, a) {
            if (!a.deleted) {
                if (a.owner.username == 'bar') {
                    total += a.money;
                } else {
                    total -= a.money;
                }
            }
            return total;
        }, 0);
        $scope.money = foodValue + accountsValue;

        function dateDiff(date1, date2){
            var diff = {}                           // Initialisation du retour
            var tmp = date2 - date1;

            tmp = Math.floor(tmp/1000);             // Nombre de secondes entre les 2 dates
            diff.sec = tmp % 60;                    // Extraction du nombre de secondes

            tmp = Math.floor((tmp-diff.sec)/60);    // Nombre de minutes (partie entière)
            diff.min = tmp % 60;                    // Extraction du nombre de minutes

            tmp = Math.floor((tmp-diff.min)/60);    // Nombre d'heures (entières)
            diff.hour = tmp % 24;                   // Extraction du nombre d'heures

            tmp = Math.floor((tmp-diff.hour)/24);   // Nombre de jours restants
            diff.day = tmp;

            return diff.day;
        }
        var now = new Date();
        var approDate = new Date(bar.settings.next_scheduled_appro);
        $scope.nbDaysBeforeAppro = (now.getHours() >= approDate.getHours()) ? dateDiff(now, approDate) + 1 : dateDiff(now, approDate);
    }
])
;
