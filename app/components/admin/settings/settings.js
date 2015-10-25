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
    ['$scope', 'api.models.bar', 'barsettings', 'api.models.sellitem',
    function($scope, APIBar, barsettings, SellItem) {
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
        // Durée d'annulation
        $scope.timeCancel = barsettings.transaction_cancel_threshold;
        $scope.saveTransactionCancel = function() {
            if ($scope.timeCancel >= 0) {
                barsettings.transaction_cancel_threshold = $scope.timeCancel;
                barsettings.$save().then(function(b) {
                    //
                }, function(errors) {
                    console.log('Erreur transaction_cancel_threshold...');
                });
            }
        };
        // Taxe par défaut
        $scope.defaultTax = barsettings.default_tax*100;
        $scope.saveDefaultTax = function() {
            if ($scope.defaultTax >= 0) {
                barsettings.default_tax = $scope.defaultTax/100;
                barsettings.$save().then(function(b) {
                    //
                }, function(errors) {
                    console.log('Erreur transaction_cancel_threshold...');
                });
            }
        };
        // Taxe pour tous les aliments
        $scope.saveTaxForAll = function() {
            if (($scope.defaultTax >= 0) && (confirm("Etes-vous sûr(e) de vouloir modifier la taxe de tous les aliments ? Cette action est irréversible"))) {
                $scope.saveDefaultTax();
                SellItem.set_global_tax($scope.defaultTax/100);
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
