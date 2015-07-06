'use strict';

angular.module('bars.root', [
    'bars.filters',

    'bars.root.bar',
    'bars.root.user',
    'bars.root.food',
    'bars.root.bug'
    ])

.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('root', {
                url: "/root",
                resolve: {
                    api: ['APIInterface', function(APIInterface) {
                        APIInterface.setBar();
                    }],
                    user: ['api.models.user', 'auth.service', function(User, AuthService) {
                        if (AuthService.isAuthenticated()) {
                            return User.me();
                        } else {
                            return null;
                        }
                    }],
                    bars_list: ['api.models.bar', function(Bar) {
                        Bar.reload();
                        return Bar.all();
                    }],
                    user_list: ['api.models.user', function(User) {
                        User.clear();
                        return User.reload();
                    }],
                    itemdetails_list: ['api.models.itemdetails', function(ItemDetails) {
                        ItemDetails.clear();
                        return ItemDetails.reload();
                    }]
                },
                views: {
                    '@': {
                        templateUrl: "components/root/common/root.html",
                        controller: 'root.ctrl.base'
                    },
                    'header@root': {
                        templateUrl: "components/root/common/header.html",
                        controller: 'root.ctrl.header'
                    },
                    'user-infos@root': {
                        templateUrl: "components/root/common/user-infos.html",
                        controller: 'root.ctrl.userInfos'
                    },
                    '@root': {
                        templateUrl: "components/root/common/home.html",
                        controller: 'root.ctrl.home'
                    }
                }
            });
}])

.controller('root.ctrl.base',
    ['$scope', '$rootScope', '$stateParams', 'auth.user',
    function($scope, $rootScope, $stateParams, AuthUser) {
        $rootScope.appLoaded = true;

        $scope.root = {
            active: 'index'
        };
        // bar = {
        //     id: $stateParams.bar,
        //     name: bar.name,
        //     accounts: accounts,
        //     search: '',
        //     foods: foods,
        //     active: 'index',
        //     infos: bar
        // };

        $scope.user = AuthUser;
    }]
)

.controller('root.ctrl.header',
    ['$scope','auth.user',
    function($scope, AuthUser) {
        $scope.login = {
            username: '',
            password: ''
        };

        $scope.connexion = function (login) {
            $scope.loginError = false;
            $scope.inLogin = true;
            AuthUser.login(login).then(
                function(user) {
                    $scope.login = {username: '', password: ''};
                    $scope.inLogin = false;
                }, function(error) {
                    $scope.loginError = true;
                    $scope.login.password = '';
                    $scope.inLogin = false;
                }
            );
        };
    }]
)

.controller(
    'root.ctrl.userInfos',
    ['$scope', 'auth.user', 'api.models.user', 'api.models.role', 'user',
    function($scope, AuthUser, User, Role, user) {
        if (user) {
            AuthUser.user = user;
        }
    }]
)

.controller('root.ctrl.home',
    ['$scope',
    function($scope){
        $scope.root.active = 'index';
    }]
)
;
