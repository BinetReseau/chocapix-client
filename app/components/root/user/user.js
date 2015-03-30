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
            controller: 'root.ctrl.user.base'
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
    ['$scope', 'user_list', '$state', 'api.models.user', 'api.models.account', 'APIInterface',
    function($scope, user_list, $state, User, Account, APIInterface) {
        $scope.root.active = 'user';
        $scope.user_list = user_list;
        $scope.searchl = '';
        $scope.findUser = function(usr) {
            $state.go('root.user.details', {id: usr.id});
        };

        // Importation
        $scope.lista = "";
        $scope.oa = [];
        $scope.$watch('lista', function () {
            if (JSON.parse($scope.lista)) {
                $scope.oa = JSON.parse($scope.lista);
            }
        });
        $scope.importUsers = function() {
            _.forEach($scope.oa, function (ouser) {
                var nuser = User.create();
                nuser.firstname = _.capitalize(_.trim(ouser.firstname));
                nuser.lastname = _.capitalize(_.trim(ouser.lastname));
                nuser.email = ouser.email;
                nuser.username = ouser.login;
                nuser.$save().then(function(u) {
                    APIInterface.setBar(ouser.section);
                    var naccount = Account.create();
                    naccount.owner = u.id;
                    //naccount.money = ouser.money;
                    naccount.$save().then(function(a) {

                    });
                });
            });
        };
    }]
)

.controller('root.ctrl.user.details',
    ['$scope', 'api.models.user', 'api.models.role', 'user_req',
    function($scope, User, Role, user){
        $scope.user = user;
        $scope.userBis = _.clone($scope.user);

        $scope.saveUser = function() {
            $scope.user.firstname = $scope.userBis.firstname;
            $scope.user.lastname = $scope.userBis.lastname;
            $scope.user.$save().then(function(u) {
                $scope.user = u;
                $scope.userBis = _.clone(u);
            });
        };
    }
])
;
