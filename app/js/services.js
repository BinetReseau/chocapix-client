'use strict';

/* Services */

var barsServices = angular.module('barsApp.services', [
	'ngStorage',
	'ngResource'
]);


barsServices.factory('AuthInterceptor', ['AuthService', '$q',
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

barsServices.factory('AuthService', ['$sessionStorage', '$http',
	function ($sessionStorage, $http) {
		// $sessionStorage.auth={};
		// $sessionStorage.auth.token=null;
		return {
			login: function(credentials){
				return $http.post('/:bar/auth/login', credentials).then(
					function(response){
						$sessionStorage.auth.token=response.data.token;
					},
					function(response){
						$sessionStorage.auth.token=null;
					});
			},
			logout: function(){
				return $http.get('/:bar/auth/logout').then(
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
}]);


barsServices.factory('User', ['$resource',
  function($resource){
	return $resource('/bars/api/user/:id', {}, {
	  query: {method:'GET', isArray:true}
	});
  }]);
barsServices.factory('Food', ['$resource',
  function($resource){
	return $resource('/bars/api/food/:id', {}, {
	  query: {method:'GET', isArray:true}
	});
  }]);
barsServices.factory('Category', ['$resource',
  function($resource){
	return $resource('/bars/api/category/:id', {}, {
	  query: {method:'GET', isArray:true}
	});
  }]);
