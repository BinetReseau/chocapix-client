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
                roles: ['api.models.role', function(Role) {
                    return Role.ofName('admin');
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
                }],
                accounts: ['api.models.account', '$stateParams', function(Account, $stateParams) {
                    return Account.ofUser($stateParams.id);
                }],
                user_roles: ['api.models.role', '$stateParams', function(Role, $stateParams) {
                    return Role.ofUser($stateParams.id);
                }]
            }
        })
    ;
}])

.controller('root.ctrl.user.base',
    ['$scope', 'user_list', 'roles', '$state', 'api.models.user', 'api.models.account', 'APIInterface',
    function($scope, user_list, roles, $state, User, Account, APIInterface) {
        $scope.root.active = 'user';
        $scope.user_list = user_list;
        $scope.searchl = '';
        $scope.search_rb = '';

        $scope.findUser = function(usr) {
            $state.go('root.user.details', {id: usr.id});
        };

        $scope.respos = _.uniq(roles, false, function (r) {
            return r.user.id;
        });

        $scope.remails = _.reduce($scope.respos, function (l, r) {
            if (r.user.email) {
                return l + ', ' + r.user.email;
            } else {
                return l;
            }
        }, '');

        // Importation
        // $scope.lista = "";
        // $scope.oa = [];
        // $scope.$watch('lista', function () {
        //     if (JSON.parse($scope.lista)) {
        //         $scope.oa = JSON.parse($scope.lista);
        //     }
        // });
        // $scope.importUsers = function() {
        //     $scope.total = $scope.oa.length;
        //     $scope.nb = 0;
        //     _.forEach($scope.oa, function (ouser) {
        //         var nuser = User.create();
        //         nuser.firstname = _.capitalize(_.trim(ouser.firstname));
        //         nuser.lastname = _.capitalize(_.trim(ouser.lastname));
        //         nuser.email = ouser.email;
        //         nuser.username = ouser.login;
        //         nuser.$save().then(function(u) {
        //             APIInterface.setBar(ouser.section);
        //             var naccount = Account.create();
        //             naccount.owner = u.id;
        //             //naccount.money = ouser.money;
        //             naccount.$save().then(function(a) {
        //                 $scope.nb++;
        //             });
        //         });
        //     });
        // };
    }]
)

.controller('root.ctrl.user.details',
    ['$scope', 'api.models.user', 'api.models.role', 'user_req', 'accounts', 'user_roles', 
    function($scope, User, Role, user, accounts, user_roles){
        $scope.user = user;
        $scope.userBis = _.clone($scope.user);
        console.log($scope.userBis);
        $scope.accounts = accounts;
        $scope.isRespoBar = function(b) {
            var res = _.filter(user_roles, function(r) {
                return r.name == "admin" && r.bar.id == b;
            });
            return res.length > 0;
        };

        $scope.saveUser = function() {
            $scope.user.firstname = $scope.userBis.firstname;
            $scope.user.lastname = $scope.userBis.lastname;
            $scope.user.email = $scope.userBis.email;
            $scope.user.$save().then(function(u) {
                $scope.user = u;
                $scope.userBis = _.clone(u);
            });
        };
    }
])
;
