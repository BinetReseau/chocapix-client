'use strict';

angular.module('bars.admin.compta', [

])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('bar.admin.compta', {
        abstract: true,
        url: "/compta",
        template: '<ui-view />'
    })
        .state('bar.admin.compta.investment', {
            url: '/investment',
            templateUrl: "components/admin/compta/investment.html",
            controller: 'admin.ctrl.compta.investment'
        })
        .state('bar.admin.compta.infos', {
            url: '/infos',
            templateUrl: "components/admin/compta/infos.html",
            controller: 'admin.ctrl.compta.infos',
            resolve: {
                account_list: ['api.models.account', function(Account) {
                    return Account.all();
                }],
                stockitem_list: ['api.models.stockitem', function(StockItem) {
                    return StockItem.all();
                }]
            }
        })
    ;
}])

.controller('admin.ctrl.compta.investment',
    ['$scope', 'api.services.action',
    function($scope, APIAction) {
        $scope.admin.active = 'compta';
        $scope.amount = 0;
        $scope.motive = '';
        $scope.saveInvestment = function() {
            if ($scope.amount > 0 && $scope.motive != 0) {
                APIAction.barInvestment({amount: $scope.amount, motive: $scope.motive}).then(function() {
                    $scope.amount = 0;
                    $scope.motive = '';
                });
            }
        };
    }
])
.controller('admin.ctrl.compta.infos',
    ['$scope', 'account_list', 'stockitem_list',
    function($scope, account_list, stockitem_list) {
        $scope.admin.active = 'compta';
        $scope.foodValue = _.reduce(stockitem_list, function (total, f) {
            if (!f.deleted) {
                total += f.qty * f.price;
            }
            return total;
        }, 0);
        $scope.soldeBar = 0;
        $scope.accountsValue = _.reduce(account_list, function (total, a) {
            if (!a.deleted) {
                if (a.owner.username == 'bar') {
                    $scope.soldeBar = a.money;
                } else {
                    total += a.money;
                }
            }
            return total;
        }, 0);
    }
])
;
