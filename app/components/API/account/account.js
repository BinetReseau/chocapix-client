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
                    'filter': function(s, showDeleted) {
                        if (!showDeleted) {
                            showDeleted = false;
                        }
                        if(!(this.owner.lastname && this.owner.firstname)) {
                            return false;
                        } else {
                            return (showDeleted || (!this.deleted && this.owner.is_active)) &&
                                (_.deburr(this.owner.lastname.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1 ||
                                _.deburr(this.owner.firstname.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1 ||
                                _.deburr(this.owner.pseudo.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1);
                        }
                    },
                    'stats': function(params) {
                        return APIInterface.request({
                            'url': 'account/' + this.id + '/stats',
                            'method': 'GET',
                            'params': params});
                    },
                    'total_spent': function(params) {
                        return APIInterface.request({
                            'url': 'account/' + this.id + '/total_spent',
                            'method': 'GET',
                            'params': params});
                    },
                    'magicbar_ranking': function(params) {
                        return APIInterface.request({
                            'url': 'account/' + this.id + '/magicbar_ranking',
                            'method': 'GET',
                            'params': params});
                    },
                    'sellitem_ranking': function(params) {
                        return APIInterface.request({
                            'url': 'account/' + this.id + '/sellitem_ranking',
                            'method': 'GET',
                            'params': params});
                    }
                }
            });
        model.ofUser = function(user) {
            return APIInterface.request({
                'url': 'account',
                'method': 'GET',
                'params': {owner: user}});
        };
        model.ranking = function(params) {
            return APIInterface.request({
                'url': 'account/ranking',
                'method': 'GET',
                'params': params});
        };
        model.coheze_ranking = function(params) {
            return APIInterface.request({
                'url': 'account/coheze_ranking',
                'method': 'GET',
                'params': params});
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
                }],
                buy_spent: ['account', function(account) {
                    return account.total_spent({type: ['buy', 'meal']});
                }],
                best_sellitem: ['account', function(account) {
                    return account.sellitem_ranking({});
                }]
            }
        });
}])

.controller('api.ctrl.account',
    ['$scope', function($scope) {
        $scope.bar.active = 'account';
    }])
.controller('api.ctrl.account_list',
    ['$scope', '$timeout', 'account_list', function($scope, $timeout, account_list) {
        $scope.account_list = _.filter(account_list, function(a) { return a.owner.is_active; });
        $scope.list_order = 'owner.lastname';
        $scope.reverse = false;
        $scope.searchl = "";
        $scope.filterAccounts = function(o) {
            return o.filter($scope.searchl, $scope.showHidden);
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

        $timeout(function () {
            document.getElementById("searchl").focus();
        }, 300);
    }])
.controller('api.ctrl.account_detail',
    ['$scope', 'account', 'api.services.action', 'api.models.user', 'api.models.role', 'roles', 'buy_spent', 'best_sellitem',
    function($scope, account, APIAction, User, Role, roles, buy_spent, best_sellitem) {
        $scope.account = account;
        $scope.buy_spent = buy_spent;
        $scope.best_sellitem = best_sellitem;
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
            User.resetPwd(account.owner.email).then(function() {
                $scope.pwdSuccess = 1;
            }, function() {
                $scope.pwdSuccess = -1;
            });

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
.directive('barsAccountOneway', function() {
    return {
        restrict: 'E',
        scope: {
            account: '=account',
            fullname: '=?'
        },
        templateUrl: 'components/API/account/directive-oneway.html'
    };
})
;
