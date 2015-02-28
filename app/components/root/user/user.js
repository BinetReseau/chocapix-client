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
    ;
}])

.controller('root.ctrl.user.base', 
    ['$scope', 'user_list', 
    function($scope, user_list){
        $scope.root.active = 'user';
    }]
)
;
