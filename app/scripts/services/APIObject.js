var module = angular.module('APIObject', [
	'ngResource'
]);

(function(module){
function shallowClearAndCopy(src, dst) {
	dst = dst || {};
	angular.forEach(dst, function(value, key) {
		delete dst[key];
	});
	for (var key in src) {
		if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
			dst[key] = src[key];
		}
	}
	return dst;
}

function shallowCopyExclude(obj, exclude) {
	var obj2 = {};
	obj.forEach(function(value, key){
		if(exclude.indexOf(key) == -1)
			obj2[key] = value;
	})
	return obj2;
}

module.factory('APIObject', ['$injector', '$resource', 'API',
	function ($injector, $resource, API) {
		var DEFAULT_METHODS = {
			'get': {method: 'GET'},
			'save': {method: 'POST'},
			'query': {method: 'GET', isArray: true},
			'remove': {method: 'DELETE'},
			'delete': {method: 'DELETE'}
		};

		return function(url, methods, structure) {
			methods = angular.extend(DEFAULT_METHODS, methods);
			var resource = $resource(url, {}, methods);

			function APIObject(value){
				shallowClearAndCopy(value || {}, this);
			}
			APIObject.$parse = function(data){
				var obj = {};
				angular.forEach(data, function(value, key){
					if(!structure[key])
						obj[key] = value;
					else {
						var parse = function(x){
							return $injector.get(structure[key].object).$parse(x);
						};
						obj[key] = structure[key].isArray ? value.map(parse) : parse(value);
					}
				})
				return new APIObject(obj);
			};
			angular.forEach(methods, function(value, key){
				APIObject[key] = function(a1, a2, a3, a4) {
					var parse = value.object ? $injector.get(value.object).$parse : this.$parse;
					var retval = {};
					retval.$resolved = false;
					var promise = resource[key](a1, a2, a3, a4).$promise.then(function(data){
						shallowClearAndCopy(value.isArray ? data.map(parse) : parse(data), retval);
						retval.$resolved = true;
						retval.$promise = promise;
						// retval.$reload = function()
						return retval;
					});
					retval.$promise = promise;
					return retval;
				}
			});
			APIObject.prototype.$reload = function(){
				shallowClearAndCopy(APIObject.get({id: this.id}), this);
			};
			return APIObject;
		};
	}])

})(module);
