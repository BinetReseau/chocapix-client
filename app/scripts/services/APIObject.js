var module = angular.module('APIObject', [
	'ngResource'
]);

(function(module){
function shallowClearAndCopy(src, dst) {
	dst = dst || {};
	angular.forEach(dst, function(value, key) {
		if(dst.hasOwnProperty(key))
			delete dst[key];
	});
	for (var key in src) {
		if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
			dst[key] = src[key];
		}
	}
	return dst;
}

function unsafeShallowClearAndCopy(src, dst) {
	dst = dst || {};
	angular.forEach(dst, function(value, key) {
		delete dst[key];
	});
	for (var key in src) {
		if (!(key.charAt(0) === '$' && key.charAt(1) === '$')) {
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
	angular.forEach(obj, function(value, key){
		if(filter(value))
			obj2[key] = filter(value);
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
			methods = angular.extend(DEFAULT_METHODS, methods);
			var resource = $resource(url, defaults,
				shallowCopyFilter(methods, function(x){
					x = angular.copy(x);
					delete x['object'];
					delete x['static'];
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
				var parse2 = !method.isArray ? parse : function(data){
					var arr = data.map(parse);
					var o = new APIObject(arr);
					for (var i = 0; i < arr.length; i++) {
						arr[i].$parent = o;
					};
					return o;
				};
				if(method.static){
					APIObject[key] = function(params, data) {
						console.log(key);
						return resource[key](params, data).$promise.then(parse2).then(function(o){
							o.$reload = function(){
								return APIObject[key](params, data);
							};
							return o;
						});
					};
				} else {
					APIObject.prototype[key] = function(params, data) {
						console.log(key);
						return resource[key](params, data || this).$promise.then(parse2).then(function(o){
							o.$reload = function(){
								return o[key](params, data);
							};
							return o;
					});
					};
				}
			});
			APIObject.prototype.$reload = function(){
				return APIObject.get({id: this.id}).then(function(obj){
					unsafeShallowClearAndCopy(obj, this);
					return this;
				})
			};
			APIObject.prototype.$reloadAll = function(){
				return this.$parent ? this.$parent.$reload(): this.$reload();
			};
			return APIObject;
		};
	}])

})(module);
