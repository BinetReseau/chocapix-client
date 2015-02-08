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
        $scope.ousername = me.username;
        $scope.checkUsername = function() {
            return _.filter(user_list, {username: $scope.nusername}).length == 0;
        };
        $scope.changeUsername = function() {
            if (_.filter(user_list, {username: $scope.nusername}).length == 0) {
                $scope.myUser.username = $scope.nusername;
                $scope.myUser.$save().then(function(u) {
                    $scope.usernameSuccess = 1;
                    $scope.nusername = '';
                }, function(errors) {
                    $scope.usernameSuccess = -1;
                    $scope.nusername = '';
                    console.log("Changement de username échoué.");
                });
            }
        };
        $scope.changePwd = function() {
            // [TODO] Vérifier le mot de passe actuel via le serveur. Droits pour modifier un mot de passe ?
            // if ($scope.newPwd == $scope.newPwdBis) {
            //     me.password = $scope.newPwd;
            //     me.$save().then(function() {
            //         $scope.pwdSuccess = 1;
            //     }, function() {
            //         $scope.pwdSuccess = -1;
            //     });
            // } else {
            //     $scope.pwdSuccess = -1;
            //     console.log('Mots de passe différents.');
            // }
        };
    }
])
;
