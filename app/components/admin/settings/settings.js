'use strict';

angular.module('bars.admin.settings', [

])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('bar.admin.settings', {
        url: "/settings",
        templateUrl: "components/admin/settings/home.html",
        controller: 'admin.ctrl.settings',
        resolve: {
            barsettings: ['api.models.barsettings' , '$stateParams', function(BarSettings, $stateParams) {
                return BarSettings.get($stateParams.bar);
            }]
        }
    });
}])

.controller('admin.ctrl.settings',
    ['$scope', 'api.models.bar', 'barsettings',
    function($scope, APIBar, barsettings) {
        $scope.admin.active = 'settings';
        // Seuil d'alerte
        $scope.moneyLimit = barsettings.money_warning_threshold;
        $scope.saveMoneyLimit = function() {
            if ($scope.moneyLimit >= 0) {
                barsettings.money_warning_threshold = $scope.moneyLimit;
                barsettings.$save().then(function(b) {
                    //
                }, function(errors) {
                    console.log('Erreur money_warning_threshold...');
                });
            }
        };
        // Agios
        $scope.agiosEnabled = barsettings.agios_enabled;
        $scope.agiosThreshold = barsettings.agios_threshold;
        $scope.agiosFactor = barsettings.agios_factor;
        $scope.saveAgio = function() {
            barsettings.agios_enabled = $scope.agiosEnabled;
            if ($scope.agiosFactor >= 0) {
                barsettings.agios_factor = $scope.agiosFactor;
                if ($scope.agiosThreshold >= 0) {
                    barsettings.agios_threshold = $scope.agiosThreshold;
                    barsettings.$save().then(function(b) {
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
