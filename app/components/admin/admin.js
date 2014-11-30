'use strict';

angular.module('bars.admin', [
    ])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('bar.admin', {
            url: "/admin",
            views: {
                '@bar': {
                    templateUrl: "components/admin/layout.html",
                    controller: 'admin.ctrl.base'
                },
                '@bar.admin': {
                    templateUrl: "components/admin/dashboard.html",
                    controller: 'admin.ctrl.home'
                }
            }
        })
        .state('bar.admin.food', {
            url: "/food",
            templateUrl: "components/admin/food/home.html",
            controller: 'admin.ctrl.food'
        })
        .state('bar.admin.account', {
            url: "/account",
            templateUrl: "components/admin/account/home.html",
            controller: 'admin.ctrl.account'
        })
        ;
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
    ['$scope',
    function($scope) {
        $scope.admin.active = 'dashboard';
    }
])
.controller('admin.ctrl.food',
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
.controller('admin.ctrl.account',
['$scope', 'api.models.account', 'api.models.user',
function($scope, Account, User) {
    $scope.admin.active = 'account';
}
])
;
