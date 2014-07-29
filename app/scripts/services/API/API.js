'use strict';

angular.module('bars.API', [
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

.factory('API.Account', ['APIObject', 'API',
	function(APIObject, API) {
		return APIObject(API.route('account/:id'), {}, {
			byUser: {method: 'GET', url:API.route('account/by-user/:id'), isArray:true, static:true}
		});
	}])
.factory('API.Action', ['APIObject', 'API',
	function(APIObject, API) {
		return APIObject('', {}, {
			buy: {method:'POST', url:API.route('action/buy'), static: true, object: 'API.Transaction'},
			give: {method: 'POST', url:API.route('action/give'), static: true, object: 'API.Transaction'},
			throwaway: {method: 'POST', url:API.route('action/throw'), static: true, object: 'API.Transaction'},
			punish: {method: 'POST', url:API.route('action/punish'), static: true, object: 'API.Transaction'},
			appro: {method:'POST', url:API.route('action/appro'), static: true, object: 'API.Transaction'},
		});
	}])
.factory('API.Bar', ['APIObject', 'API',
	function(APIObject, API) {
		return APIObject(API.route(''));
	}])
.factory('API.Food', ['APIObject', 'API',
	function(APIObject, API) {
		return APIObject(API.route('food/:id'), {}, {
			add: {method: 'POST', url:API.route('food/add'), static: true, object: 'API.Transaction'}
		});
	}])
.factory('API.Me', ['APIObject', 'API',
	function(APIObject, API) {
		return APIObject(API.route('account/me'), {}, {
			all: {method:'GET', url:API.route('../nobar/auth/me'), static: true}
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
				uncancel: {method:'POST', url:API.route('transaction/uncancel/:id')},
				byAccount: {method:'GET', url:API.route('transaction/by-account/:id'), isArray: true, static: true},
				byItem: {method:'GET', url:API.route('transaction/by-item/:id'), isArray: true, static: true}
			// },
			// {
			// 	author: {object: 'API.User'},
			// 	// operations: {object: 'API.Operation', isArray: true}
			}
		);
	}]);
