'use strict';

angular.module('bars.root.user', [
    
])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('root.user', {
        abstract: true,
        url: "/user",
        template: "<ui-view />",
        controller: ['$scope', function($scope) {
            $scope.root.active = 'user';
        }]
    })
        .state('root.user.base', {
            url: '/home',
            templateUrl: "components/root/user/home.html",
            controller: 'root.ctrl.user.base',
            resolve: {
                user_list: ['api.models.user', function(User) {
                    return User.all();
                }]
            }
        })
        .state('root.user.details', {
            url: '/:id',
            templateUrl: "components/root/user/details.html",
            controller: 'root.ctrl.user.details',
            resolve: {
                user_req: ['api.models.user', '$stateParams', function(User, $stateParams) {
                    return User.getSync($stateParams.id);
                }]
            }
        })
    ;
}])

.controller('root.ctrl.user.base', 
    ['$scope', 'user_list', '$state', 
    function($scope, user_list, $state){
        $scope.root.active = 'user';
        $scope.user_list = user_list;
        $scope.searchl = '';
        $scope.findUser = function(usr) {
            $state.go('root.user.details', {id: usr.id});
        };
    }]
)

.controller('root.ctrl.user.details', 
    ['$scope', 'api.models.user', 'api.models.role', 'user_req', 
    function($scope, User, Role, user){
        $scope.user = user;
    }
])
;
