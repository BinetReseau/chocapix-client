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
    }
])
.controller('admin.ctrl.food',
    ['$scope', 'api.models.food',
    function($scope, Food) {
        $scope.admin.active = 'food';
        $scope.food = Food.create();
        $scope.addFood = function() {
            $scope.food.buy_unit_value = 1;
            $scope.food.qty = $scope.food.qty/$scope.food.unit_value;
            $scope.food.unit_value = 1/$scope.food.unit_value;
            $scope.food.bar = 'avironjone'; // [TODO]Adapter bars-django
            $scope.food.$save().then(function(newFood) {
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
