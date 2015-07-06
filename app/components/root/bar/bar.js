'use strict';

angular.module('bars.root.bar', [
    //
])

.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('root.bar', {
                url: "/bar",
                abstract: true,
                template: "<ui-view />"
            })
                .state('root.bar.list', {
                    url: '/list',
                    templateUrl: "components/root/bar/list.html",
                    resolve: {
                        bars_list: ['api.models.bar', 'api.models.barsettings', function(Bar, BarSettings) {
                            return Bar.reload();
                        }]
                    },
                    controller: 'root.ctrl.bar.list'
                })
                .state('root.bar.add', {
                    url: '/add',
                    templateUrl: "components/root/bar/add.html",
                    controller: 'root.ctrl.bar.add'
                })
        ;
    }
])

.controller('root.ctrl.bar.list',
    ['$scope', '$stateParams', 'api.models.bar', 'bars_list',
    function($scope, $stateParams, APIBar, bars_list) {
        $scope.root.active = 'bars';
        $scope.bars_list = bars_list;
        $scope.list_order = 'name';
        $scope.reverse = false;
        $scope.searchl = "";
        console.log($scope.bars_list);

        $scope.filterBar = function(o) {
            return o.filter($scope.searchl);
        };
    }]
)

.controller('root.ctrl.bar.add', 
    ['$scope', 'api.models.bar', 
    function($scope, APIBar) {
        $scope.bar = APIBar.create();

        $scope.addBar = function(b) {
            b.$save().then(function(rb) {
                console.log(rb);
            }, function(e) {
                console.log(e);
            });
        };
    }]
)
;
