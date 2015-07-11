'use strict';

angular.module('bars.root.news', [
    //
])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('root.news', {
        abstract: true,
        url: "/news",
        template: "<ui-view />",
        controller: ['$scope', function($scope) {
            $scope.root.active = 'news';
        }]
    })
        .state('root.news.base', {
            url: '/home',
            templateUrl: "components/root/news/home.html",
            controller: 'root.ctrl.news.base',
            resolve: {
                //
            }
        })
}])

.controller('root.ctrl.news.base', 
    ['$scope', 'api.models.news', 
    function($scope, News) {
        //
    }]
)
;