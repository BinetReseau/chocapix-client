'use strict';

angular.module('bars.api.account', [
    'APIModel'
    ])

.factory('api.models.account', ['APIModel', 'APIInterface',
    function(APIModel, APIInterface) {
        var model = new APIModel({
                url: 'account',
                type: "Account",
                structure: {
                    'bar': 'Bar',
                    'owner': 'User'
                },
                methods: {
                    'filter': function(s) {
                        if(!(this.owner.lastname && this.owner.firstname)) {
                            return false;
                        } else {
                            return !this.deleted && this.owner.is_active && _.deburr(this.owner.lastname.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1 || _.deburr(this.owner.firstname.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1 ||
                                _.deburr(this.owner.pseudo.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1;
                        }
                    }
                }
            });
        model.ofUser = function(user) {
            return APIInterface.request({
                'url': 'account',
                'method': 'GET',
                'params': {owner: user}});
        };

        return model;
    }])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('bar.account', {
            url: "/account",
            abstract: true,
            template:'<ui-view/>',
            controller: 'api.ctrl.account'
        })
        .state('bar.account.list', {
            url: "/list",
            templateUrl: "components/API/account/list.html",
            controller: 'api.ctrl.account_list',
            resolve: {
                account_list: ['api.models.account', function(Account) {
                    return Account.all();
                }]
            }
        })
        .state('bar.account.details', {
            url: "/:id",
            templateUrl: "components/API/account/details.html",
            controller: 'api.ctrl.account_detail',
            resolve:{
                account: ['api.models.account', '$stateParams', function(Account, $stateParams) {
                    return Account.getSync($stateParams.id);
                }],
                roles: ['api.models.role', 'account', function(Role, account) {
                    return Role.ofUser(account.owner.id);
                }]
            }
        });
}])

.controller('api.ctrl.account',
    ['$scope', function($scope) {
        $scope.bar.active = 'account';
    }])
.controller('api.ctrl.account_list',
    ['$scope', 'account_list', function($scope, account_list) {
        $scope.account_list = _.filter(account_list, function(a) { return a.owner.is_active; });
        $scope.list_order = 'owner.lastname';
        $scope.reverse = false;
        $scope.searchl = "";
        $scope.filterAccounts = function(o) {
            return o.filter($scope.searchl);
        };
        $scope.filterHidden = function() {
            if ($scope.showHidden) {
                return '';
            } else {
                return {
                    deleted: false
                };
            }
        };
    }])
.controller('api.ctrl.account_detail',
    ['$scope', 'account', 'api.services.action', 'api.models.user', 'api.models.role', 'roles',
    function($scope, account, APIAction, User, Role, roles) {
        $scope.account = account;
        $scope.query = {
            type: 'give',
            motive: '',
            qty: ''
        };
        $scope.queryProcess = function(query) {
            if (query.type == 'give') {
                APIAction.give({account: account.id, amount: query.qty}).then(function() {
                    $scope.query.qty = '';
                });
            }
            if (query.type == 'deposit') {
                APIAction.deposit({account: account.id, amount: query.qty}).then(function() {
                    $scope.query.qty = '';
                });
            }
            if (query.type == 'punish') {
                APIAction.punish({account: account.id, amount: query.qty, motive: query.motive}).then(function() {
                    $scope.query.qty = '';
                    $scope.query.motive = '';
                });
            }
            if (query.type == 'refund') {
                APIAction.refund({account: account, amount: query.qty, motive: query.motive}).then(function() {
                    $scope.query.qty = '';
                });
            }
            if (query.type == 'withdraw') {
                APIAction.withdraw({account: account, amount: query.qty}).then(function() {
                    $scope.query.qty = '';
                });
            }
        };
        $scope.in = {
            pseudo: false,
            username: false
        };
        // Onglet "Modifier"
        $scope.roles = roles;
        $scope.pwdSuccess = 0;
        $scope.jaiCompris = false;
        $scope.resetPwd = function() {
            // [TODO]
        };
        $scope.toggleDeleted = function() {
            $scope.account.deleted = !$scope.account.deleted;
            $scope.account.$save();
        };

        $scope.rolesName = {
            customer: "Consommateur",
            treasurer: "Trésorier",
            newsmanager: "Respo actualités",
            policeman: "Respo amendes",
            appromanager: "Respo appro",
            inventorymanager: "Respo inventaire",
            stockmanager: "Respo appro et inventaire",
            admin: "Respo bar"
        };
        $scope.rolesNameAuthorized = {
            customer: "Consommateur",
            treasurer: "Trésorier",
            newsmanager: "Respo actualités",
            policeman: "Respo amendes"
            // appromanager: "Respo appro",
            // inventorymanager: "Respo inventaire",
            // stockmanager: "Respo appro et inventaire",
            // admin: "Respo bar"
        };
        $scope.permsName = {
            "bars_transactions.add_buytransaction": "Acheter un aliment",
            "bars_transactions.add_throwtransaction": "Jeter un aliment",
            "bars_transactions.add_givetransaction": "Faire un don",
            "bars_transactions.add_mealtransaction": "Faire une bouffe à plusieurs",
            "bars_bugtracker.add_bugreport": "Reporter un bug",
            "bars_news.change_news": "Gérer les actualités",
            "bars_transactions.add_deposittransaction": "Créditer un compte",
            "bars_transactions.add_punishtransaction": "Mettre une amende",
            "bars_transactions.add_collectivePaymenttransaction": "Paiement collectif",
            "bars_transactions.add_barInvestmenttransaction": "Loguer les achats de matériel du bar",
            "bars_core.change_account": "Gérer les comptes",
            "bars_transactions.add_inventorytransaction": "Faire un inventaire",
            "bars_transactions.add_approtransaction": "Faire une appro",
            "bars_core.change_role": "Gérer les rôles"
        };
        $scope.rolen = 'customer';
        $scope.permExist = function (perm) {
            return $scope.permsName[perm];
        };
        $scope.addRole = function (name) {
            var newRole = Role.create();
            newRole.user = account.owner.id;
            newRole.name = name;
            newRole.bar = 'avironjone'; // TEMP
            newRole.$save().then(function () {
                updateRoles();
            });
            if (name == "appromanager" || name == "inventorymanager" || name == "stockmanager") {
                var newGRole = Role.create();
                newGRole.user = account.owner.id;
                newGRole.name = 'additem'; // TEMP - TO CHANGE
                newGRole.bar = 'root';
                newGRole.$save();
            }
            if (name == "admin") {
                var newGRole = Role.create();
                newGRole.user = account.owner.id;
                newGRole.name = 'respobar'; // TEMP - TO CHANGE
                newGRole.bar = 'root';
                newGRole.$save();
            }
        };
        $scope.removeRole = function (role) {
            role.$delete().then(function () {
                updateRoles();
            });
        };
        function updateRoles() {
            Role.ofUser(account.owner.id).then(function (r) {
                $scope.roles = r;
            });
        };
    }])

.directive('barsAccount', function() {
    return {
        restrict: 'E',
        scope: {
            account: '=account'
        },
        templateUrl: 'components/API/account/directive.html'
    };
})
;
