'use strict';

angular.module('bars.auth', [
    'ngStorage'
])

// cannot inject $http directly because it would cause a conflict when registering AuthInterceptor
.factory('auth.service',
    ['$injector', '$localStorage', '$q', 'APIURL',
    function ($injector, $localStorage, $q, APIURL) {
        if ($localStorage.auth === undefined) {
            $localStorage.auth = {
                token: null
            };
        }
        return {
            login: function(credentials) {
                return $injector.get('$http').post(APIURL + '/api-token-auth/', credentials, {'headers':{'Content-Type':"application/json"}}).then(
                    function(response) {
                        $localStorage.auth.token = response.data.token;
                        return response.data.user;
                    },
                    function(response) {
                        $localStorage.auth.token = null;
                        return $q.reject(response);
                    });
            },
            logout: function() {
                $localStorage.auth.token = null;
            },
            isAuthenticated: function() {
                return $localStorage.auth.token !== null;
            },
            getToken: function() {
                return $localStorage.auth.token;
            }
        };
}])

.factory('auth.user',
    ['auth.service', '$rootScope', '$q', '$timeout', 'api.models.account', 'api.models.user', 'api.models.role', 'api.models.menu', '$state', '$stateParams',
    function (AuthService, $rootScope, $q, $timeout, Account, User, Role, Menu, $state, $stateParams) {
        return {
            user: null,
            account: null,
            roles: [],
            perms: [],
            menus: [],
            login: function(credentials) {
                var self = this;
                return AuthService.login(credentials).then(
                    function(user) {
                        return User.me().then(function(user) {
                            self.user = user;
                            Account.ofUser(user.id).then(function(account) {
                                if (account && account.length == 1) {
                                    account = Account.get(account[0].id);
                                    account.total_spent({type: ['buy', 'meal']}).then(function(data){
                                        account.spent = data.total_spent;
                                    });
                                    Account.ranking({type: ['buy', 'meal']}).then(function(data){
                                        var rankings = data.sort(function(a, b) {if (a.val < b.val) {return -1;} else if (a.val > b.val) {return 1;} else {return 0;}});
                                        for (var i = 0 ; i < rankings.length ;  i++) {
                                            if (rankings[i].id == account.id){
                                                account.rank = i + 1;
                                            }
                                        }
                                    });
                                } else {
                                    account = null;
                                }

                                self.account = account;
                                $timeout(function() {
                                    if(document.getElementById("q_alim")) {
                                        document.getElementById("q_alim").focus();
                                    }
                                }, 300);

                                Menu.request({user: self.user.id}).then(function(menus) {
                                    $rootScope.$broadcast('auth.hasLoggedIn');
                                    self.menus = menus;
                                });
                            }, function (error) {
                                self.account = null;
                            });
                            // Permissions dans le bar courant
                            Role.ofUser(user.id).then(function(roles) {
                                self.roles = self.roles.concat(roles);
                                self.computePerms();
                            }, function (error) {
                                self.roles = [];
                            });
                            // Permissions globales
                            Role.ofUser(user.id, 'root').then(function(roles) {
                                self.roles = self.roles.concat(roles);
                                self.computePerms();
                            }, function (error) {
                                self.roles = [];
                            });
                            return self.user;
                        });
                    }, function(response) {
                        return $q.reject(response);
                    }
                );
            },
            logout: function() {
                AuthService.logout();
                this.user = null;
                this.account = null;
                this.roles = [];
                this.perms = [];
                this.menus = [];
                $rootScope.$broadcast('auth.hasLoggedOut');

                if($stateParams.bar) {
                    $state.go('bar', {bar: $stateParams.bar});
                } else {
                    $state.go('index');
                }

                $timeout(function() {
                    document.getElementById("floginc").focus();
                }, 300);
            },
            isAuthenticated: function() {
                return this.user != null;
            },
            computePerms: function() {
                this.perms = [];
                for (var i = 0; i < this.roles.length; i++) {
                    this.perms = this.perms.concat(this.roles[i].perms);
                }
                _.uniq(this.perms);
            },
            can: function (perm) {
                return this.isAuthenticated() && ((_.findIndex(this.perms, function (p) {
                    return p.indexOf('.' + perm) > -1;
                }) > -1) || this.user.username == 'admin');
            },
            hasAccount: function() {
                return this.account != null;
            }
        };
    }])

.factory('auth.interceptor', ['auth.service', '$q',
    function (AuthService, $q) {
        return {
            request: function(config) {
                config.headers = config.headers || {};
                if (AuthService.isAuthenticated() && !/\/off\//.test(config.url) && !/fr\.openfoodfacts\.org/.test(config.url)) {
                    config.headers.Authorization = 'JWT ' + AuthService.getToken();
                }

                // config.params = config.params || {};
                // // to improve: necessary for ui.bootstrap ; and the token is useless for static files
                // if (AuthService.isAuthenticated() && /^((http)|[^a-z])/.test(config.url)) {
                //     config.params["bearer"] = AuthService.getToken();
                // }
                return config || $q.when(config);
            },
            response: function(response) {
                if (response.status === 401) {
                    AuthService.logout();
                    // TODO: Redirect user to login page.
                }
                return response || $q.when(response);
            },
            responseError: function(response) {
                console.log(response);
                if (response.status === 401) {
                    AuthService.logout();
                    // TODO: Redirect user to login page.
                }
                return $q.reject(response);
            }
        };
}]);
