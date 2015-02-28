'use strict';

angular.module('bars.root.food', [
    
])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('root.food', {
        abstract: true,
        url: "/food",
        template: "<ui-view />",
        controller: ['$scope', function($scope) {
            $scope.root.active = 'food';
        }]
    })
        .state('root.food.base', {
            url: '/home',
            templateUrl: "components/root/food/home.html",
            controller: 'root.ctrl.food.base'/*,
            resolve: {
                user_list: ['api.models.user', function(User) {
                    return User.all();
                }]
            }*/
        })
        // .state('root.user.details', {
        //     url: '/:id',
        //     templateUrl: "components/root/user/details.html",
        //     controller: 'root.ctrl.user.details',
        //     resolve: {
        //         user_req: ['api.models.user', '$stateParams', function(User, $stateParams) {
        //             return User.getSync($stateParams.id);
        //         }]
        //     }
        // })
    ;
}])

.controller('root.ctrl.food.base', 
    ['$scope', 
    function($scope){
        //
    }]
)
;
