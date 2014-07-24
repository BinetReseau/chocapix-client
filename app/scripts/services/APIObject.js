var module = angular.module('APIObject', [
	'ngResource'
]);


(function(module){
function shallowClearAndCopy(src, dst) {
	dst = dst || {};
	for (var key in dst) {
		if (dst.hasOwnProperty(key)) {
			delete dst[key];
		}
	}
	for (var key in src) {
		if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
			dst[key] = src[key];
		}
	}
	return dst;
}

function shallowCopy(src, dst) {
	dst = dst || {};
	for (var key in src) {
		if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
			dst[key] = src[key];
		}
	}
	return dst;
}

function shallowCopyFilter(obj, filter) {
	var obj2 = {};
	var filtered;
	angular.forEach(obj, function(value, key){
		filtered = filter(value);
		if(filtered != undefined) {
			obj2[key] = filtered;
		}
	})
	return obj2;
}

module.factory('APIObject', ['$injector', '$resource', 'API',
	function ($injector, $resource, API) {
		var DEFAULT_METHODS = {
			'get': {method: 'GET', static:true},
			'save': {method: 'POST'},
			'query': {method: 'GET', isArray: true, static:true},
			'remove': {method: 'DELETE'},
			'delete': {method: 'DELETE'}
		};

		return function(url, defaults, methods, structure) {
			structure = structure || {};
			methods = angular.extend(DEFAULT_METHODS, methods);
			var resource = $resource(url, defaults,
				shallowCopyFilter(methods, function(x){
					x = angular.copy(x);
					delete x['object'];
					delete x['static'];
					return x;
				}));

			function APIObject(value){
				shallowCopy(value || {}, this);
			}
			APIObject.$parse = function(data){
				if(angular.isArray(data)) {
					var arr = data.map(function(x){
						var o = APIObject.$parse(x);
						o.$parent = arr;
						return o;
					});
					arr.$reload = APIObject.prototype.$reload;
					return arr;
				} else {
					var obj = new APIObject();
					angular.forEach(data, function(value, key){
						if(!structure[key])
							obj[key] = value;
						else {
							obj[key] = $injector.get(structure[key].object).$parse(value);
							obj[key].$parent = obj;
						}
					});
					return obj;
				}
			};
			angular.forEach(methods, function(method, key){
				function f(is_static){
					return function(params, data) {
						console.log(key + '(' + (method.url || url) + ')');
						var obj = method.isArray ? [] : new APIObject();
						obj.$resolved = false;
						obj.$promise = resource[key](params, is_static ? data : (data || this)).$promise
								.then(method.object ? $injector.get(method.object).$parse : APIObject.$parse)
								.then(function(new_obj){
									new_obj.$reload = function(){
										var o = (is_static ? APIObject : new_obj)[key](params, data);
										o.$promise = o.$promise.then(function(oo){
											shallowClearAndCopy(oo, obj);
											return oo;
										});
										return o;
									};
									return new_obj;
								})
								.then(function(new_obj){
									console.log('returned ' + key + '(' + (method.url || url) + ')');
									console.log(new_obj);
									shallowClearAndCopy(new_obj, obj);
									obj.$resolved = true;
									return obj;
								});
						return obj;
					}
				}
				if(method.static){
					APIObject[key] = f(true);
				} else {
					APIObject.prototype[key] = f(false);
				}
			});
			APIObject.prototype.$reload = function(){
				if(this.$parent)
					this.$parent.$reload();
			};
			return APIObject;
		};
	}])

})(module);
