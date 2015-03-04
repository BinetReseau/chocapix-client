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
                        bars_list: ['api.models.bar', function(Bar) {
                            return Bar.reload();
                        }]
                    },
                    controller: 'root.ctrl.bar.list'
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
    }]
)
;
