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
			'get': {method: 'GET', static: true},
			'save': {method: 'POST'},
			'query': {method: 'GET', isArray: true, static: true},
			'remove': {method: 'DELETE'},
			'delete': {method: 'DELETE'}
		};

		return function APIObject(url, defaults, methods, structure) {
			if(!url && !methods) return;
			structure = structure || {};
			methods = angular.extend(DEFAULT_METHODS, methods);
			var resource = $resource(url, defaults,
				shallowCopyFilter(methods, function(x){
					x = angular.copy(x);
					delete x['object'];
					delete x['static'];
					return x;
				}));

			function APIEntity(value){
				shallowCopy(value || {}, this);
			}
			APIEntity.prototype = new APIObject();
			APIEntity.$parse = function(data){
				if(angular.isArray(data)) {
					var arr = data.map(function(x){
						var o = APIEntity.$parse(x);
						o.$parent = arr;
						return o;
					});
					arr.$reload = APIEntity.prototype.$reload;
					return arr;
				} else {
					var obj = new APIEntity();
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
					return function(a1, a2, a3, a4) {
						console.log(key + '(' + (method.url || url) + ')');
						var args = arguments;
						var obj = method.isArray ? [] : new APIEntity();
						obj.$resolved = false;
						obj.$promise = resource[key].apply(resource, is_static ? args : [a1, this, a2, a3]).$promise
								.then(method.object ? $injector.get(method.object).$parse : APIEntity.$parse)
								.then(function(new_obj){
									shallowClearAndCopy(new_obj, obj);
									obj.$reload = function reload() {
										var call_obj =  (is_static ? APIEntity : obj);
										var o = call_obj[key].apply(call_obj, args);
										o.$promise = o.$promise.then(function(oo){
											shallowClearAndCopy(oo, obj);
											obj.$reload = reload; // oo.$reload is linked to oo
											return oo;
										});
										return o;
									};
									obj.$resolved = true;
									return obj;
								})
								.then(function(obj){
									console.log('returned ' + key + '(' + (method.url || url) + ')');
									console.log(obj);
									return obj;
								});
						return obj;
					}
				}
				if(method.static){
					APIEntity[key] = f(true);
				} else {
					APIEntity.prototype[key] = f(false);
				}
			});
			APIEntity.prototype.$reload = function(){
				if(this.$parent)
					this.$parent.$reload();
			};
			return APIEntity;
		};
	}])

})(module);
