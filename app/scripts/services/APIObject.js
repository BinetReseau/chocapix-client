var module = angular.module('APIObject', [
	'ngResource'
]);

module.filter('array', function() {
	return angular.identity;
	// return function(obj) {
	// 	var length = 0;
	// 	for (var key in obj) {
	// 		if (obj.hasOwnProperty(key) && !isNaN(parseInt(key))) {
	// 			key = parseInt(key);
	// 			length = key>length ? key : length;
	// 		}
	// 	}
	// 	length++;

	// 	var filtered = [];
	// 	for (var j = 0; j < length; j++) {
	// 		filtered.push(obj[j]);
	// 	}
	// 	return filtered;
	// };
});


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
				var parseOne = method.object ? $injector.get(method.object).$parse : APIObject.$parse;
				var parse = !method.isArray ? parseOne : function(data){
					var arr = data.map(parseOne);
					var o = new APIObject(arr);
					// var o = arr;
					for (var i = 0; i < arr.length; i++) {
						arr[i].$parent = o;
					};
					// o.__proto__ = APIObject.prototype;
					return o;
				};
				function f(is_static){
					return function(params, data) {
						console.log(key + '(' + (method.url || url) + ')');
						var value = method.isArray ? [] : {};
						value.$resolved = false;
						value.$promise = resource[key](params, is_static ? data : (data || this)).$promise
								.then(parse)
								.then(function(o){
									o.$reload = function(){
										var o = (is_static ? APIObject : o)[key](params, data);
										o.$promise.then(function(oo){
											shallowClearAndCopy(oo, value);
											return oo;
										})
										return o;
									};
									return o;
								})
								.then(function(o){
									console.log('returned ' + key + '(' + (method.url || url) + ')');
									console.log(o);
									shallowClearAndCopy(o, value);
									value.$resolved = true;
									return value;
								});
						return value;
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
				if(this.$parent)
					this.$parent.$reload();
			};
			return APIObject;
		};
	}])

})(module);
