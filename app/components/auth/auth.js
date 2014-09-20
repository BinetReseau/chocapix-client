'use strict';

angular.module('bars.auth', [
    'ngStorage'
])

// cannot inject $http directly because it would cause a conflict when registering AuthInterceptor
.factory('auth.service', ['$injector', '$localStorage', '$q',
    function ($injector, $localStorage, $q) {
        if ($localStorage.auth === undefined) {
            $localStorage.auth = {
                token: null
            };
        }
        return {
            login: function(credentials, resultLogin) {
                // Todo: correct routing
                return $injector.get('$http').post('/../../api-token-auth/', credentials, {'headers':{'Content-Type':"application/json"}}).then(
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
                if (response.status === 401) {
                    AuthService.logout();
                    // TODO: Redirect user to login page.
                }
                return $q.reject(response);
            }
        };
}]);
