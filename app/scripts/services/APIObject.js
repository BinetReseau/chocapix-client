var module = angular.module('APIObject', [
	'ngResource'
]);

// // Overrides default angularjs filterFilter
// module.filter('filter', function() {
// 	return function(array, expression, comparator) {
// 		// if (!angular.isArray(array)) return array;
// 		if(!array || typeof array != "object") return array;
// 		var comparatorType = typeof(comparator),
// 			predicates = [];
// 		predicates.check = function(value) {
// 			for (var j = 0; j < predicates.length; j++) {
// 				if (!predicates[j](value)) {
// 					return false;
// 				}
// 			}
// 			return true;
// 		};
// 		if (comparatorType !== 'function') {
// 			if (comparatorType === 'boolean' && comparator) {
// 				comparator = function(obj, text) {
// 					return angular.equals(obj, text);
// 				};
// 			} else {
// 				comparator = function(obj, text) {
// 					if (obj && text && typeof obj === 'object' && typeof text === 'object') {
// 						for (var objKey in obj) {
// 							if (objKey.charAt(0) !== '$' && hasOwnProperty.call(obj, objKey) && comparator(obj[objKey], text[objKey])) {
// 								return true;
// 							}
// 						}
// 						return false;
// 					}
// 					text = ('' + text).toLowerCase();
// 					return ('' + obj).toLowerCase().indexOf(text) > -1;
// 				};
// 			}
// 		}
// 		var search = function(obj, text) {
// 			if (typeof text == 'string' && text.charAt(0) === '!') {
// 				return !search(obj, text.substr(1));
// 			}
// 			switch (typeof obj) {
// 				case "boolean":
// 				case "number":
// 				case "string":
// 					return comparator(obj, text);
// 				case "object":
// 					switch (typeof text) {
// 						case "object":
// 							return comparator(obj, text);
// 						default:
// 							for (var objKey in obj) {
// 								if (objKey.charAt(0) !== '$' && search(obj[objKey], text)) {
// 									return true;
// 								}
// 							}
// 							break;
// 					}
// 					return false;
// 				case "array":
// 					for (var i = 0; i < obj.length; i++) {
// 						if (search(obj[i], text)) {
// 							return true;
// 						}
// 					}
// 					return false;
// 				default:
// 					return false;
// 			}
// 		};
// 		switch (typeof expression) {
// 			case "boolean":
// 			case "number":
// 			case "string":
// 				// Set up expression object and fall through
// 				expression = {
// 					$: expression
// 				};
// 				// jshint -W086
// 			case "object":
// 				// jshint +W086
// 				for (var key in expression) {
// 					(function(path) {
// 						if (typeof expression[path] === 'undefined') return;
// 						predicates.push(function(value) {
// 							return search(path == '$' ? value : (value && value[path]), expression[path]);
// 						});
// 					})(key);
// 				}
// 				break;
// 			case 'function':
// 				predicates.push(expression);
// 				break;
// 			default:
// 				return array;
// 		}

// 		function length(obj) {
// 			if(obj instanceof Array) return obj.length;
// 			var max = 0;
// 			for (var key in obj) {
// 				if (obj.hasOwnProperty(key) && !!parseInt(key)) {
// 					max = key>max ? key : max;
// 				}
// 			}
// 			return max + 1;
// 		};

// 		var filtered = [];
// 		for (var j = 0; j < length(array); j++) {
// 			var value = array[j];
// 			if (predicates.check(value)) {
// 				filtered.push(value);
// 			}
// 		}
// 		return filtered;
// 	};
// });
module.filter('array', function() {
	return function(obj) {
		var length = 0;
		for (var key in obj) {
			if (obj.hasOwnProperty(key) && !!parseInt(key)) {
				length = key>length ? key : length;
			}
		}

		var filtered = [];
		for (var j = 0; j < length; j++) {
			filtered.push(obj[j]);
		}
		return filtered;
	};
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
					for (var i = 0; i < arr.length; i++) {
						arr[i].$parent = o;
					};
					return o;
				};
				function f(is_static){
					return function(params, data) {
						console.log(key + '(' + (method.url || url) + ')');
						var value = {};
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
					Object.defineProperty(APIObject.prototype, key, {
						enumerable: false,
						configurable: true,
						writable: true,
						value: f(false)
					})
					// APIObject.prototype[key] = f(false);
				}
			});
			APIObject.prototype.$reload = function(){
				var o = APIObject.get({id: this.id});
				o.$promise.then(function(obj){
					shallowClearAndCopy(obj, this);
					return obj;
				});
				return o;
			};
			APIObject.prototype.$reloadAll = function(){
				return this.$parent ? this.$parent.$reload(): this.$reload();
			};
			return APIObject;
		};
	}])

})(module);
