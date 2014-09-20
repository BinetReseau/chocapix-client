'use strict';

angular.module('bars.ctrl.admin', [
    ])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('bar.admin', {
            url: "/admin",
            views: {
                '@bar': {
                    templateUrl: "components/admin/layout.html",
                    controller: 'AdminBaseCtrl'
                },
                '@bar.admin': {
                    templateUrl: "components/admin/dashboard.html",
                    controller: 'AdminHomeCtrl'
                }
            }
        })
        .state('bar.admin.food', {
            url: "/food",
            templateUrl: "components/admin/Food/home.html",
            controller: 'AdminFoodCtrl'
        });
}])

    .controller('AdminBaseCtrl',
        ['$scope',
        function($scope) {
            $scope.bar.active = 'admin';
            $scope.admin = {
                active: ''
            };
        }
    ])
    .controller('AdminHomeCtrl',
        ['$scope',
        function($scope) {
            $scope.admin.active = 'dashboard';
        }
    ])
    .controller('AdminFoodCtrl',
        ['$scope', 'api.models.food',
        function($scope, Food) {
            $scope.admin.active = 'food';
            $scope.food = Food.create();
            $scope.addFood = function(food) {
                Food.save(food).then(function(newFood) {
                    $scope.food = Food.create();
                }, function(errors) {
                    // TODO: display form errors
                });
            };
        }
    ])
;
