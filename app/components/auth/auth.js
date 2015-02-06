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
    ['auth.service', '$rootScope', '$q', 'api.models.account', 'api.models.user', 'api.models.role',
    function (AuthService, $rootScope, $q, Account, User, Role) {
        return {
            user: null,
            account: null,
            role: null,
            login: function(credentials) {
                return AuthService.login(credentials).then(
                    function(user) {
                        User.me().then(function(user) {
                            this.user = user;
                            Account.ofUser(user.id).then(function(account) {
                                if (account && account.length > 0) {
                                    account = Account.get(account[0].id);
                                } else {
                                    account = null;
                                }

                                this.account = account;
                                $rootScope.$broadcast('auth.hasLoggedIn');
                            }, function (error) {
                                this.account = null;
                            });
                            Role.find(user.id, bar.id).then(function(role) {
                                if (role && role.length > 0) {
                                    role = role[0];
                                } else {
                                    role = null;
                                }

                                this.role = role;
                            }, function (error) {
                                this.role = null;
                            });
                        });
                        return this.user;
                    }, function(response) {
                        return $q.reject(response);
                    }
                );
            },
            logout: function() {
                Auth.logout();
                this.user = null;
                this.account = null;
                this.role = null;
                $rootScope.$broadcast('auth.hasLoggedOut');
            },
            isAuthenticated: function() {
                return AuthService.isAuthenticated();
            },
            can: function (perm) {
                return this.isAuthenticated() && this.role && _.indexOf(this.role.perms, "bars_api." + perm) > -1;
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
                if (AuthService.isAuthenticated()) {
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
