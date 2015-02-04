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
        .state('bar.settings.pwd', {
            url: "/pwd",
            templateUrl: "components/settings/pwd.html",
            controller: 'settings.ctrl.pwd',
            resolve: {
                me: ['api.models.user', function(User) {
                    return User.me();
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
.controller('settings.ctrl.pwd', 
    ['$scope', 'me', 'auth.service', 'api.models.user', 
    function($scope, me, Auth, User) {
        $scope.settings.active = 'pwd';
        $scope.oldPwd = null;
        $scope.newPwd = null;
        $scope.newPwdBis = null;
        $scope.changeSuccess = 0;
        $scope.changePwd = function() {
            // [TODO] Vérifier le mot de passe actuel via le serveur. Droits pour modifier un mot de passe ?
            // if ($scope.newPwd == $scope.newPwdBis) {
            //     me.password = $scope.newPwd;
            //     me.$save().then(function() {
            //         $scope.changeSuccess = 1;
            //     }, function() {
            //         $scope.changeSuccess = -1;
            //     });
            // } else {
            //     $scope.changeSuccess = -1;
            //     console.log('Mots de passe différents.');
            // }
        };
    }
])
;
