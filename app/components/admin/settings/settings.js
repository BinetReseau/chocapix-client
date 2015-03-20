'use strict';

angular.module('bars.admin.settings', [
    
])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('bar.admin.settings', {
        url: "/settings",
        templateUrl: "components/admin/settings/home.html",
        controller: 'admin.ctrl.settings',
        resolve: {
            bar: ['api.models.bar' , '$stateParams', function(Bar, $stateParams) {
                return Bar.get($stateParams.bar);
            }]
        }
    });
}])

.controller('admin.ctrl.settings',
    ['$scope', 'api.models.bar', 'bar',
    function($scope, APIBar, bar) {
        $scope.admin.active = 'settings';
        // Seuil d'alerte
        $scope.moneyLimit = bar.money_warning_threshold;
        $scope.saveMoneyLimit = function() {
            if ($scope.moneyLimit >= 0) {
                bar.money_warning_threshold = $scope.moneyLimit;
                bar.$save().then(function(b) {
                    //
                }, function(errors) {
                    console.log('Erreur money_warning_threshold...');
                });
            }
        };
        // Agios
        $scope.agiosEnabled = bar.agios_enabled;
        $scope.agiosThreshold = bar.agios_threshold;
        $scope.agiosFactor = bar.agios_factor;
        $scope.saveAgio = function() {
            bar.agios_enabled = $scope.agiosEnabled;
            if ($scope.agiosFactor >= 0) {
                bar.agios_factor = $scope.agiosFactor;
                if ($scope.agiosThreshold >= 0) {
                    bar.agios_threshold = $scope.agiosThreshold;
                    bar.$save().then(function(b) {
                        //
                    }, function(errors) {
                        console.log('Erreur agios...');
                    });
                }
            } 
        };
    }]
)
;
