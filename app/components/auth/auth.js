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
    ['auth.service', '$rootScope', '$q', '$timeout', 'api.models.account', 'api.models.user', 'api.models.role', '$state', '$stateParams', 
    function (AuthService, $rootScope, $q, $timeout, Account, User, Role, $state, $stateParams) {
        return {
            user: null,
            account: null,
            roles: [],
            perms: [],
            admin: false, // TEMP [TODO] there are no global perms now...
            login: function(credentials) {
                var self = this;
                return AuthService.login(credentials).then(
                    function(user) {
                        return User.me().then(function(user) {
                            self.user = user;
                            Account.ofUser(user.id).then(function(account) {
                                if (account && account.length == 1) {
                                    account = Account.get(account[0].id);
                                } else {
                                    account = null;
                                }

                                self.account = account;
                                $rootScope.$broadcast('auth.hasLoggedIn');
                                $timeout(function() {
                                    if(document.getElementById("q_alim")) {
                                        document.getElementById("q_alim").focus();
                                    }
                                }, 300);
                            }, function (error) {
                                self.account = null;
                            });
                            Role.ofUser(user.id).then(function(roles) {
                                self.roles = roles;
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
                $rootScope.$broadcast('auth.hasLoggedOut');

                $state.go('bar', {bar: $stateParams.bar});

                $timeout(function() {
                    document.getElementById("floginc").focus();
                }, 300);
            },
            isAuthenticated: function() {
                return AuthService.isAuthenticated();
            },
            computePerms: function() {
                this.perms = [];
                this.admin = false;
                for (var i = 0; i < this.roles.length; i++) {
                    this.perms = this.perms.concat(this.roles[i].perms);
                    if (this.roles[i].name == 'admin' || this.roles[i].name == 'staffmanager') {
                        this.admin = true;
                    }
                }
                _.uniq(this.perms);
            },
            can: function (perm) {
                return this.isAuthenticated() && (this.admin || _.findIndex(this.perms, function (p) {
                    return p.indexOf('.' + perm) > -1;
                }) > -1);
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
