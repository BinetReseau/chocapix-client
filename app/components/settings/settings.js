'use strict';

angular.module('bars.settings', [

    ])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('bar.settings', {
            url: "/settings",
            views: {
                '@bar': {
                    templateUrl: "components/settings/layout.html",
                    controller: 'settings.ctrl.base'
                }
            }
        })
        // Settings password
        .state('bar.settings.credentials', {
            url: "/credentials",
            templateUrl: "components/settings/credentials.html",
            controller: 'settings.ctrl.credentials',
            resolve: {
                me: ['api.models.user', function(User) {
                    return User.me();
                }],
                user_list: ['api.models.user', function(User) {
                    return User.all();
                }]
            }
        })
        ;
}])

.controller('settings.ctrl.base',
    ['$scope',
    function($scope) {
        $scope.bar.active = 'settings';
        $scope.settings = {
            active: ''
        };
    }
])
.controller('settings.ctrl.credentials', 
    ['$scope', 'me', 'auth.service', 'api.models.user', 'user_list', 
    function($scope, me, Auth, User, user_list) {
        $scope.settings.active = 'credentials';
        $scope.pwdSuccess = 0;
        $scope.usernameSuccess = 0;
        $scope.oldPwd = null;
        $scope.newPwd = null;
        $scope.newPwdBis = null;
        $scope.myUser = me;
        $scope.checkUsername = function() {
            return _.filter(user_list, {username: $scope.nusername}).length == 0;
        };
        $scope.changeUsername = function() {
            if (_.filter(user_list, {username: $scope.nusername}).length == 0) {
                var tempUsername = $scope.nusername;
                $scope.nusername = '';
                $scope.myUser.username = tempUsername;
                $scope.myUser.$save().then(function(u) {
                    $scope.usernameSuccess = 1;
                    $scope.myUser = u;
                }, function(errors) {
                    $scope.usernameSuccess = -1;
                    User.me().then(function(u) {
                        $scope.myUser = u;
                    });
                    $scope.nusername = '';
                    console.log("Changement de username échoué.");
                });
            }
        };
        $scope.changePwd = function() {
            if ($scope.newPwd == $scope.newPwdBis) {
                console.log(me);
                User.changePwd($scope.oldPwd, $scope.newPwd);//.then(function() {
                //     $scope.pwdSuccess = 1;
                // }, function(errors) {
                //     $scope.pwdSuccess = -1;
                // });
                // me.$save().then(function() {
                //     $scope.pwdSuccess = 1;
                // }, function() {
                //     $scope.pwdSuccess = -1;
                // });
            } else {
                $scope.pwdSuccess = -1;
                console.log('Mots de passe différents.');
            }
        };
    }
])
;
