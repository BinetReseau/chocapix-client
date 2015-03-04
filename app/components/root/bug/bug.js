'use strict';

angular.module('bars.root.bug', [
    //
])

.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('root.bug', {
                url: "/bug",
                abstract: true,
                template: "<ui-view />"
            })
                .state('root.bug.list', {
                    url: '/list',
                    templateUrl: "components/root/bug/list.html",
                    resolve: {
                        bug_list: ['api.models.bug', function(Bug) {
                            Bug.clear();
                            Bug.reload();
                            return Bug.all();
                        }]
                    },
                    controller: 'root.ctrl.bug.list'
                })
        ;
    }
])

.controller('root.ctrl.bug.list',
    ['$scope', '$stateParams', 'api.models.bug', 'bug_list',
    function($scope, $stateParams, APIBar, bug_list) {
        $scope.root.active = 'bug';
        $scope.bug_list = _.filter(bug_list, function(b) {
            return b.fixed == true;
        });
        console.log($scope.bug_list);
        $scope.solve = function(bug) {
            bug.fixed = true;
            bug.$save();
        }
    }]
)
;