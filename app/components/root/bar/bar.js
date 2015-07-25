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
                template: "<ui-view />",
                controller: ['$scope', function($scope) {
                    $scope.root.active = 'bar';
                }]
            })
                .state('root.bar.list', {
                    url: '/list',
                    templateUrl: "components/root/bar/list.html",
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
        $scope.bars_list = bars_list;
        $scope.list_order = 'name';
        $scope.reverse = false;
        $scope.searchl = "";
        console.log($scope.bars_list);

        $scope.filterBar = function(o) {
            return o.name != 'Root' && o.filter($scope.searchl);
        };

        $scope.deleteBar = function(b) {
            if (confirm('Cette action est irréversible ! Toutes les transactions de ce bar, ainsi que les comptes seront définitivement perdus. Es-tu sûr de vouloir continuer ?')) {
                b.$delete().then(function() {
                    //
                });
            }
        };
    }]
)

.controller('root.ctrl.bar.add', 
    ['$scope', 'api.models.bar', '$state', 
    function($scope, APIBar, $state) {
        $scope.bar = APIBar.create();
        console.log($scope.bar);

        $scope.addBar = function(b) {
            b.model.save(b).then(function(rb) {
                $state.go('root.bar.list');
            }, function(e) {
                console.log(e);
            });
        };
    }]
)
;
