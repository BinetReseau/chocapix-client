'use strict';

angular.module('bars.root.user', [
    //
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
            if (r.user.email && r.bar.id != 'root' && r.name == "admin") {
                return l + r.user.email + ', ';
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
    ['$scope', 'api.models.user', 'api.models.role', 'user_req', 'accounts', 'user_roles', 'bars_list', 
    function($scope, User, Role, user_req, accounts, user_roles, bars_list, me){
        // General data
        console.log($scope.me);
        $scope.user_req = user_req;
        $scope.accounts = accounts;
        console.log(user_roles);
        $scope.roles = user_roles;

        // Info tab
        $scope.isRespoBar = function(b) {
            var res = _.filter($scope.roles, function(r) {
                return r.name == "admin" && r.bar.id == b;
            });
            return res.length > 0;
        };

        // Edit tab
        $scope.userBis = _.clone($scope.user_req);
        $scope.saveUser = function() {
            $scope.user_req.firstname = $scope.userBis.firstname;
            $scope.user_req.lastname = $scope.userBis.lastname;
            $scope.user_req.email = $scope.userBis.email;
            $scope.user_req.$save().then(function(u) {
                $scope.user_req = u;
                $scope.userBis = _.clone(u);
            });
        };

        // Perm tab
        $scope.rights = {
            active: false
        };
        var member_bars = [];
        _.forEach(user_roles, function(r) {
            if (r.bar.id != 'root')
                member_bars.push(r.bar.id);
        });
        member_bars = _.uniq(member_bars);
        $scope.bars_list = _.filter(bars_list, function(b) {
            return member_bars.indexOf(b.id) > -1;
        });

        $scope.appointAdmin = function(b) {
            var newRole = Role.create();
            newRole.name = "admin";
            newRole.user = user_req.id;
            newRole.bar = b;
            newRole.$save().then(function() {
                updateRoles();
            });

            var newGRole = Role.create();
            newGRole.user = user_req.id;
            newGRole.name = 'staff';
            newGRole.bar = 'root';
            newGRole.$save();
        };
        $scope.removeAdmin = function (b) {
            var role = _.find($scope.roles, function(r) {
                return r.bar.id == b && r.name == "admin";
            });
            if (role != null) {
                role.$delete().then(function () {
                    updateRoles();
                });
            }
        };
        function updateRoles() {
            Role.ofUser(user_req.id).then(function (r) {
                $scope.roles = r;
            });
        };
    }
])
;
