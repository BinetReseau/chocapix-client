'use strict';

angular.module('bars.API', [
	'ngResource'
])

.factory('API', [
	function () {
		var barId="bar";
		return {
			setBarId: function(barid){
				barId=barid
			},
			route: function(path){
				// return '/'+barId+'/'+path;
				return '/../../bars-symfony/web/' + barId + (path=='' ? '' : '/'+path);
			}
		};
}])

.factory('API.Account', ['$resource', 'API',
	function($resource, API) {
		return $resource(API.route('account/:id'), {}, {
			query: {method:'GET', isArray:true},
			byUser: {method: 'GET', url:API.route('account/by-user/:id'), isArray:true}
		});
	}])
.factory('API.Action', ['$resource', 'API',
	function($resource, API) {
		return $resource(API.route('action'), {}, {
			buy: {method:'POST', url:API.route('action/buy')},
			give: {method: 'POST', url:API.route('action/give')},
			throwaway: {method: 'POST', url:API.route('action/throw')}
		});
	}])
.factory('API.Bar', ['$resource', 'API',
	function($resource, API) {
		return $resource(API.route(''));
	}])
.factory('API.Food', ['$resource', 'API',
	function($resource, API) {
		return $resource(API.route('food/:id'), {}, {
			query: {method:'GET', isArray:true},
			search: {method:'GET', url:API.route('food/search/:q'), isArray:true}
		});
	}])
.factory('API.Me', ['$resource', 'API',
	function($resource, API) {
		return $resource(API.route('account/me'), {}, {
			all: {method:'GET', url:API.route('../nobar/auth/me')}
		});
	}])
.factory('API.Transaction', ['$resource', 'API',
	function($resource, API) {
		return $resource(API.route('transaction/:id'), {}, {
			query: {method:'GET', isArray:true},
			byAccount: {method:'GET', url:API.route('transaction/by-account/:id'), isArray:true},
			byItem: {method:'GET', url:API.route('transaction/by-item/:id'), isArray:true},
			cancel: {method:'POST', url:API.route('transaction/cancel/:id')}
		});
	}])
.factory('API.User', ['$resource', 'API',
	function($resource, API) {
		return $resource(API.route('user/:id'), {}, {
			query: {method:'GET', isArray:true}
		});
	}]);
