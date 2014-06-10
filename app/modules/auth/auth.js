'use strict';

angular.module('bars.auth', [
	'ngStorage',
	'bars.API'
])

.factory('AuthService', ['$injector', '$sessionStorage','API',
	function ($injector, $sessionStorage, API) {
		$sessionStorage.auth={};
		$sessionStorage.auth.token=null;
		return {
			login: function(credentials){
				return $injector.get('$http').post(API.route('auth/login'), credentials).then(
					function(response){
						$sessionStorage.auth.token=response.data.token;
					},
					function(response){
						$sessionStorage.auth.token=null;
					});
			},
			logout: function(){
				return $injector.get('$http').get(API.route('auth/logout')).then(
					function(response){
						$sessionStorage.auth.token=null;
					},
					function(response){
						$sessionStorage.auth.token=null;
					});
			},
			isAuthenticated: function(){
				return $sessionStorage.auth.token != null;
			},
			getToken: function(){
				return $sessionStorage.auth.token;
			}
		};
}])

.factory('AuthInterceptor', ['AuthService', '$q',
	function (AuthService, $q) {
		return {
			request: function(config) {
				config.headers = config.headers || {};
				if (AuthService.isAuthenticated()) {
					config.headers.Authorization = 'Bearer ' + AuthService.getToken();
				}
				return config || $q.when(config);
			},
			response: function(response) {
				if (response.status === 401) {
					// TODO: Redirect user to login page.
				}
				return response || $q.when(response);
			}
		};
}]);
