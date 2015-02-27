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
    ;
}])

.controller('admin.ctrl.compta.investment', 
    ['$scope', 'api.services.action', 
    function($scope, APIAction){
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
;
