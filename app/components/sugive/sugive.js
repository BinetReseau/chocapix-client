'use strict';

angular.module('bars.sugive', [
        ])

.controller('sugive.ctrl',
        ['$scope', 'api.models.account', 'api.services.action',
        function($scope, Account, APIAction) {
            // autocomplétion
            var accounts = Account.all();
            $scope.accountsf = function (v) {
                return _.filter(Account.all(), function (a) {
                    return a.filter(v);
                });
            };
            $scope.send = function() {
                APIAction.give({account: $scope.toAccount.id, amount: $scope.amount, author: $scope.fromAccount.owner.id}).then(function() {
                    $scope.fromLabel="";
                    $scope.toLabel="";
                    $scope.amount=null;
                });
            };
            $scope.fromAccount = null,
            $scope.toAccount = null,
            $scope.amount = null
        }]
        )
.directive('barsSugive', function() {
    return {
        scope: true,
        restrict: 'E',
        templateUrl: 'components/sugive/directive.html',
        controller: 'sugive.ctrl',
    };
})
