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

.factory('API.User', ['$resource', 'API',
  function($resource, API) {
	return $resource(API.route('user/:id'), {}, {
	  query: {method:'GET', isArray:true}
	});
  }])
.factory('API.Account', ['$resource', 'API',
  function($resource, API) {
	return $resource(API.route('account/:id'), {}, {
	  query: {method:'GET', isArray:true}
	});
  }])
.factory('API.Transaction', ['$resource', 'API',
  function($resource, API) {
	return $resource(API.route('transaction/:id'), {}, {
	  query: {method:'GET', isArray:true},
	  byAccount: {method:'GET', url:API.route('transaction/by-account/:id'), isArray:true},
	  byItem: {method:'GET', url:API.route('transaction/by-item/:id'), isArray:true}
	});
  }])
.factory('API.Bar', ['$resource', 'API',
  function($resource, API) {
	return $resource(API.route(''));
  }])
.factory('API.Me', ['$resource', 'API',
  function($resource, API) {
	return $resource(API.route('account/me'), {}, {
	  all: {method:'GET', url:API.route('../nobar/auth/me'), isArray:false}
	});
  }])
.factory('API.Food', ['$resource', 'API',
  function($resource, API) {
	return $resource(API.route('food/:id'), {}, {
	  query: {method:'GET', isArray:true},
	  search: {method:'GET', url:API.route('food/search/:q'), isArray:true},
	  buy: {method:'POST', url:API.route('buy')},
      jeter: {method: 'POST', url:API.route('jeter')}
	});
  }]);
