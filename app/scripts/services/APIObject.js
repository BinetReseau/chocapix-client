var module = angular.module('APIObject', [
	'ngResource'
]);

module.filter('array', function() {
	return function(obj) {
		// var length = 0;
		// for (var key in obj) {
		// 	if (obj.hasOwnProperty(key) && !isNaN(parseInt(key))) {
		// 		key = parseInt(key);
		// 		length = key>length ? key : length;
		// 	}
		// }
		// length++;

		// var filtered = [];
		// for (var j = 0; j < length; j++) {
		// 	filtered.push(obj[j]);
		// }
		// return filtered;
		return obj.resource || obj;
	};
});


(function(module){
// function shallowClearAndCopy(src, dst) {
// 	dst = dst || {};
// 	for (var key in dst) {
// 		if (dst.hasOwnProperty(key)) {
// 			delete dst[key];
// 		}
// 	}
// 	for (var key in src) {
// 		if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
// 			dst[key] = src[key];
// 		}
// 	}
// 	return dst;
// }

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
				var obj = {};
				angular.forEach(data, function(value, key){
					if(!structure[key])
						obj[key] = value;
					else {
						var parse = function(x){
							return $injector.get(structure[key].object).$parse(x);
						};
						obj[key] = structure[key].isArray ? value.map(parse) : parse(value);
						obj[key].$parent = obj;
					}
				})
				return new APIObject(obj);
			};
			angular.forEach(methods, function(method, key){
				var parse = method.object ? $injector.get(method.object).$parse : APIObject.$parse;
				function f(is_static){
					return function(params, data) {
						console.log(key + '(' + (method.url || url) + ')');
						var obj = new APIObject();
						obj.$resolved = false;
						obj.$promise = resource[key](params, is_static ? data : (data || this)).$promise
								.then(function(data){
									if(method.isArray) {
										var arr = data.map(parse);
										for (var i = 0; i < arr.length; i++) {
											arr[i].$parent = obj;
										};
										obj.resource = arr;
									} else {
										obj.resource = parse(data);
										obj.resource.$parent = obj;
									}
									return obj;
								})
								.then(function(obj){
									obj.$reload = function(){
										var o = (is_static ? APIObject : o)[key](params, data);
										o.$promise.then(function(new_obj){
											obj.resource = new_obj.resource;
											return new_obj;
										})
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
					APIObject[key] = f(true);
				} else {
					// Object.defineProperty(APIObject.prototype, key, {
					// 	enumerable: false,
					// 	configurable: true,
					// 	writable: true,
					// 	value: f(false)
					// })
					APIObject.prototype[key] = f(false);
				}
			});
			APIObject.prototype.$reload = function(){
				// var o = APIObject.get({id: this.id});
				// o.$promise.then(function(obj){
				// 	shallowClearAndCopy(obj, this);
				// 	return obj;
				// });
				// return o;
				if(this.$parent)
					return this.$parent.$reload();
			};
			// APIObject.prototype.$reloadAll = function(){
			// 	return this.$parent ? this.$parent.$reload(): this.$reload();
			// };
			return APIObject;
		};
	}])

})(module);
