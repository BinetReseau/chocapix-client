'use strict';

angular.module('bars.API', [
	'ngResource',
	'APIObject'
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

// .factory('API.Account', ['$resource', 'API',
// 	function($resource, API) {
// 		return $resource(API.route('account/:id'), {}, {
// 			query: {method:'GET', isArray:true},
// 			byUser: {method: 'GET', url:API.route('account/by-user/:id'), isArray:true}
// 		});
// 	}])
.factory('API.Action', ['$resource', 'API',
	function($resource, API) {
		return $resource('', {}, {
			buy: {method:'POST', url:API.route('action/buy')},
			give: {method: 'POST', url:API.route('action/give')},
			throwaway: {method: 'POST', url:API.route('action/throw')}
		});
	}])
// .factory('API.Bar', ['$resource', 'API',
// 	function($resource, API) {
// 		return $resource(API.route(''));
// 	}])
// .factory('API.Food', ['$resource', 'API',
// 	function($resource, API) {
// 		return $resource(API.route('food/:id'), {}, {
// 			query: {method:'GET', isArray:true},
// 			search: {method:'GET', url:API.route('food/search/:q'), isArray:true}
// 		});
// 	}])
// .factory('API.Me', ['$resource', 'API',
// 	function($resource, API) {
// 		return $resource(API.route('account/me'), {}, {
// 			all: {method:'GET', url:API.route('../nobar/auth/me')}
// 		});
// 	}])
// .factory('API.Transaction', ['$resource', 'API',
// 	function($resource, API) {
// 		return $resource(API.route('transaction/:id'), {}, {
// 			cancel: {method:'DELETE'},
// 			query: {method:'GET', isArray:true},
// 			byAccount: {method:'GET', url:API.route('transaction/by-account/:id'), isArray:true},
// 			byItem: {method:'GET', url:API.route('transaction/by-item/:id'), isArray:true}
// 		});
// 	}])
// .factory('API.User', ['$resource', 'API',
// 	function($resource, API) {
// 		return $resource(API.route('user/:id'), {}, {
// 			query: {method:'GET', isArray:true}
// 		});
// 	}])

.factory('API.Account', ['APIObject', 'API',
	function(APIObject, API) {
		return APIObject(API.route('account/:id'), {}, {
			byUser: {method: 'GET', url:API.route('account/by-user/:id'), isArray:true, static:true}
		});
	}])
.factory('API.Bar', ['APIObject', 'API',
	function(APIObject, API) {
		return APIObject(API.route(''));
	}])
.factory('API.Food', ['APIObject', 'API',
	function(APIObject, API) {
		return APIObject(API.route('food/:id'), {}, {
		});
	}])
.factory('API.Me', ['APIObject', 'API',
	function(APIObject, API) {
		return APIObject(API.route('account/me'), {}, {
			all: {method:'GET', url:API.route('../nobar/auth/me'), static:true}
		});
	}])
.factory('API.User', ['APIObject', 'API',
	function(APIObject, API) {
		return APIObject(API.route('user/:id'), {id:'@id'}, {
		});
	}])
.factory('API.Transaction', ['APIObject', 'API',
	function(APIObject, API) {
		return APIObject(
			API.route('transaction/:id'), {id:'@id'},
			{
				cancel: {method:'DELETE'},
				byAccount: {method:'GET', url:API.route('transaction/by-account/:id'), isArray:true, static:true},
				byItem: {method:'GET', url:API.route('transaction/by-item/:id'), isArray:true, static:true}
			},
			{
				author: {object: 'API.User'},
				// operations: {object: 'API.Operation', isArray: true}
			}
		);
	}]);


