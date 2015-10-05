'use strict';

angular.module('bars.admin.account', [

])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('bar.admin.account', {
        url: '/account',
        abstract: true,
        template: "<ui-view />",
        controller: 'admin.ctrl.account'
    })
        .state('bar.admin.account.add', {
            url: '/add',
            templateUrl: "components/admin/account/add.html",
            controller: 'admin.ctrl.account.add',
            resolve: {
                user_list: ['api.models.user', function(User) {
                    return User.all();
                }]
            }
        })
        .state('bar.admin.account.import', {
            url: '/import',
            templateUrl: "components/admin/account/import.html",
            controller: 'admin.ctrl.account.import'
        })
        .state('bar.admin.account.collectivePayment', {
            url: '/fist',
            templateUrl: "components/admin/account/collectivePayment.html",
            controller: 'admin.ctrl.account.collectivePayment',
            resolve: {
                account_list: ['api.models.account', function(Account) {
                    return Account.all();
                }]
            }
        })
    ;
}])

.controller('admin.ctrl.account',
    ['$scope',
    function($scope) {
        $scope.admin.active = 'account';
    }
])
.controller('admin.ctrl.account.add',
    ['$scope', 'api.models.account', 'api.models.user', 'api.services.action', '$state', 'user_list', 
    function($scope, Account, User, APIAction, $state, user_list) {
        $scope.admin.active = 'account';
        $scope.nuser = User.create();
        $scope.naccount = Account.create();
        $scope.naccount.amoney = 0;
        $scope.errorMessage = false;
        function checkUsername(uname) {
            return _.filter(user_list, function (u) {
                return u.username.toLocaleLowerCase() == uname.toLocaleLowerCase();
            }).length == 0;
        }
        $scope.isValidEmail = function(email){
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return re.test(email);
        };
        $scope.checkUsername = checkUsername;
        $scope.isValidUser = function(usr, acnt) {
            var lastnameTest = usr.lastname && usr.lastname.length > 0;
            var firstnameTest = usr.firstname && usr.firstname.length > 0;
            var emailTest = usr.email && usr.email.length > 0;
            var usernameTest = usr.username.length > 0 && checkUsername(usr.username);
            var pwdTest = usr.passwordBis && usr.password.length > 0 && usr.password == usr.passwordBis;
            var moneyTest = acnt.amoney !== '' && acnt.amoney >= 0;
            return lastnameTest && firstnameTest && usernameTest && emailTest && pwdTest && moneyTest;
        };

        // Import an user in the current bar
        // Retrieve the bars' users
        var barUsers = {};
        _.forEach(Account.all(), function(a) {
            barUsers[a.owner.id] = true;
        });
        // Remove users already having an account in the current bar
        var users_list = _.filter(user_list, function(u) {
            return u.username != 'bar' && !barUsers[u.id];
        });
        $scope.users_list = users_list;
        $scope.user = null;
        $scope.findUser = function(usr) {
            $scope.user = usr;
        }
        $scope.account = Account.create();
        $scope.money = 0;

        $scope.createAccount = function(usr, money) {
            $scope.naccount.owner = usr.id;
            delete $scope.naccount.amoney;
            $scope.naccount.$save().then(function(a) {
                if (money > 0) {
                    APIAction.deposit({account: a.id, amount: money}).then(function() {
                        $state.go('bar.account.details', {id: a.id});
                    }, function(errors) {
                       $scope.errorMessage = true;
                    });
                }
            }, function(errors) {
                $scope.errorMessage = true;
            });
        };
        $scope.createUser = function(usr, money) {
            if (usr.password == usr.passwordBis) {
                usr.firstname = _.capitalize(_.trim(usr.firstname));
                usr.lastname = _.trim(usr.lastname);
                usr.$save().then(function(u) {
                    $scope.createAccount(u, money);
                }, function(errors) {
                    $scope.errorMessage = true;
                });
            } else {
                $scope.password = '';
                $scope.passwordBis = '';
                console.log("Mots de passe différents");
            }
        };
        
    }
])
.controller('admin.ctrl.account.import',
    ['$scope', 'api.models.account', 'api.models.user', 'api.services.action', '$state',
    function($scope, Account, User, APIAction, $state) {
        $scope.admin.active = 'account';
        $scope.lista = "";
        $scope.oa = [];
        $scope.$watch('lista', function () {
            if (JSON.parse($scope.lista)) {
                $scope.oa = JSON.parse($scope.lista);
            }
        });
        $scope.importAccounts = function() {
            _.forEach($scope.oa, function (ouser) {
                var nuser = User.create();
                nuser.firstname = _.capitalize(_.trim(ouser.firstname));
                nuser.lastname = _.trim(ouser.lastname);
                nuser.email = ouser.email;
                nuser.username = ouser.login;
                nuser.$save().then(function(u) {
                    var naccount = Account.create();
                    naccount.owner = u.id;
                    //naccount.money = ouser.money;
                    naccount.$save().then(function(a) {
                        if (ouser.money > 0) {
                            APIAction.deposit({account: a.id, amount: ouser.money});
                        } else if (ouser.money < 0) {
                            APIAction.punish({account: a.id, amount: -ouser.money, motive: "Création du compte"});
                        }
                    });
                });
            });
        };
    }
])
.controller('admin.ctrl.account.collectivePayment',
    ['$scope', 'api.services.action', 'account_list',
    function($scope, APIAction, account_list) {
        $scope.admin.active = 'account';
        $scope.account_list = _.filter(account_list, function(a) { return a.owner.is_active && !a.deleted; });
        $scope.account_list = _.forEach($scope.account_list, function(a) { a.pay = true; });
        $scope.list_order = 'owner.lastname';
        $scope.reverse = false;
        $scope.searchl = "";
        $scope.filterAccounts = function(o) {
            return o.filter($scope.searchl);
        };
        $scope.allSelected = true;
        $scope.toggleAll = function () {
            $scope.allSelected = !$scope.allSelected;
            _.map($scope.account_list, function (o) {
                o.pay = $scope.allSelected;
            });
        };
        $scope.collectivePay = function () {
            var accounts = _.map(_.filter($scope.account_list, function (a) {
                return a.pay;
            }), function (a) {
                return {account: a, ratio: 1};
            });
            APIAction.collectivePayment({accounts: accounts, amount: $scope.amount, motive: $scope.motive}).then(function () {
                $scope.amount = 0;
                $scope.motive = "";
                $scope.allSelected = true;
                _.map($scope.account_list, function (o) {
                    o.pay = false;
                });
            })
        };
    }
])
