'use strict';

var module = angular.module('APIModel', [
]);


(function(module){
module.factory('MemoryEntityStore', [
	function() {
		function MemoryEntityStore() {
			// Maps entity id with entity object
			this.entity_map = {};
			// Stores entity objects; live array
			this.entity_array = [];
		}
		MemoryEntityStore.prototype.get = function(id) {
			return this.entity_map[id];
		};
		MemoryEntityStore.prototype.all = function() {
			return this.entity_array;
		};
		MemoryEntityStore.prototype.create = function(obj) {
			var id = obj.id;
			if(id && !this.get(id)) {
				this.entity_map[id] = obj;
				var index = _.sortedIndex(this.entity_array, {'id': id}, "id");
				this.entity_array.splice(index, 0, obj);
			}
			return this.get(id);
		};
		MemoryEntityStore.prototype.update = function(id, obj) {
			if(this.get(id)) {
				var orig = this.get(id);
				if(orig !== obj) {
					// _.forOwn(orig, function(v, k) {
					// 	delete orig[k];
					// });
					// _.assign(orig, obj);
					orig.$update(obj);
				}
				return orig;
			} else {
				return this.create(obj);
			}
		};
		MemoryEntityStore.prototype.delete = function(id) {
			if(this.get(id)) {
				delete this.entity_map[id];
				var index = _.sortedIndex(this.entity_array, {'id': id}, "id");
				if(this.entity_array[index].id == id) {
					this.entity_array.splice(index, 1);
				}
			}
			return null;
		};
		return MemoryEntityStore;
	}
]);

module.factory('RemoteCRUDEntityStore', ['$http',
	function ($http) {
		var getData = _.property("data");
		function RemoteCRUDEntityStore(url, factory) {
			this.url = url;
			factory = factory || {};
			factory.parse = factory.parse ||  _.identity;
			factory.unparse = factory.unparse ||  _.identity;
			this.factory = factory;
		}
		RemoteCRUDEntityStore.prototype.get = function(id) {
			return $http.get(this.url + "/" + id).then(getData)
					.then(this.factory.parse);
		};
		RemoteCRUDEntityStore.prototype.all = function() {
			return $http.get(this.url).then(getData)
					.then(this.factory.parse);
		};
		RemoteCRUDEntityStore.prototype.create = function(obj) {
			obj = this.factory.unparse(obj);
			console.log(angular.toJson(obj));
			return $http.post(this.url, obj).then(getData)
					.then(this.factory.parse);
		};
		RemoteCRUDEntityStore.prototype.update = function(id, obj) {
			obj = this.factory.unparse(obj);
			// return $http.put(this.url + "/" + id, obj).then(getData)
			// 		.then(this.factory.parse);
			return $http.post(this.url + "/" + id, obj).then(getData)
					.then(this.factory.parse);
		};
		RemoteCRUDEntityStore.prototype.delete = function(id) {
			return $http.delete(this.url + "/" + id).then(getData)
					.then(this.factory.parse);
		};
		return RemoteCRUDEntityStore;
	}
]);

module.factory('CachedRemoteEntityStore', ['$q', 'MemoryEntityStore', 'RemoteCRUDEntityStore',
	function ($q, MemoryEntityStore, RemoteCRUDEntityStore) {
		function CachedRemoteEntityStore(url, factory) {
			this.url = url;
			this.local_store = new MemoryEntityStore();
			this.remote_store = new RemoteCRUDEntityStore(url, factory);
			this.factory = factory || {};
			this.factory.create = this.factory.create ||  function(){return {};};
		}
		CachedRemoteEntityStore.prototype.get = function(id) {
			if(this.local_store.get(id)) {
				return $q.when(this.local_store.get(id));
			} else {
				var self = this;
				return this.remote_store.get(id)
					.then(function(obj) {
						return self.local_store.create(obj);
				});
			}
		};
		CachedRemoteEntityStore.prototype.all = function() {
			var self = this;
			return this.remote_store.all()
				.then(function(array) {
					_.each(array, function(o) {
						self.local_store.update(o.id, o);
					});
					return self.local_store.all();
			});
		};
		CachedRemoteEntityStore.prototype.create = function(obj) {
			var self = this;
			return this.remote_store.create(obj)
				.then(function(obj) {
					return self.local_store.create(obj);
			});
		};
		CachedRemoteEntityStore.prototype.update = function(id, obj) {
			var self = this;
			this.local_store.update(id, obj);
			return this.remote_store.update(id, obj)
				.then(function(obj) {
					return self.local_store.update(id, obj);
			});
		};
		CachedRemoteEntityStore.prototype.delete = function(id) {
			var self = this;
			return this.remote_store.delete(id)
				.then(function() {
					self.local_store.delete(id);
			});
		};
		return CachedRemoteEntityStore;
	}
]);

module.factory('APIEntity', [
	function() {
		function APIEntity(model){
			// this.$update(obj);
		}
		APIEntity.prototype.$update = function(obj) {
			var self = this;
			_.forOwn(this, function(v, k) {
				delete self[k];
			});
			_.assign(this, obj);
		};
		APIEntity.prototype.$save = function() {
			this.model.save(this.id);
		};
		Object.defineProperty(APIEntity, "model", {
			configurable: true,
			enumerable: false,
			writable: true
		});
		return APIEntity;
	}
]);

module.factory('APIModel', ['APIEntity',
	function(APIEntity) {
		function APIModel(entity_store, structure, model_type) {
			this.entity_store = entity_store;
			this.structure = structure;
			this.model_type = model_type;
		}
		APIModel.prototype.create = function(obj) {
			var entity = new APIEntity(this);
			entity.model = this;
			if(obj) {
				entity.$update(obj);
			}
			entity._type = this.model_type;
			return entity;
		};
		APIModel.prototype.store = function(obj) {
			return this.entity_store.create(obj);
		};
		APIModel.prototype.get = function(id) {
			return this.entity_store.get(id);
		};
		APIModel.prototype.all = function() {
			return this.entity_store.all();
		};
		APIModel.prototype.update = function(obj) {
			return this.entity_store.update(obj.id, obj);
		};
		APIModel.prototype.delete = function(id) {
			return this.entity_store.delete(id);
		};
		return APIModel;
	}
]);

module.factory('APIModelFactory', ['APIModel', 'APIEntity', 'CachedRemoteEntityStore',
	function (APIModel, APIEntity, EntityStore) {
		var APIModelFactory = {};

		// Maps model name with model object
		APIModelFactory.model_map = {};

		APIModelFactory.create = function (url, defaults, methods, structure, model_type) {
			var entity_factory = {
				parse: _.bind(this.parse, this),
				unparse: function(data) {
					return _.omit(data, ['model']);
				}};
			var store = new EntityStore(url, entity_factory);
			var model = new APIModel(store, structure, model_type);
			if(model_type) {
				this.model_map[model_type] = model;
			}
			return model;
		};

		APIModelFactory.parse = function(obj) {
			if(_.isArray(obj)) {
				obj = _.map(obj, _.bind(this.parse, this));
			} else if(!(obj instanceof APIEntity) && obj._type && this.model_map[obj._type]) {
				var model = this.model_map[obj._type];
				obj = model.create(obj);
			}
			return obj;
		};

		// APIModelFactory.store = function(obj) {
		// 	if(_.isArray(obj)) {
		// 		obj = _.map(obj, _.bind(this.store, this));
		// 	} else if(!obj instanceof APIEntity && obj._type && this.model_map[obj._type]) {
		// 		var Model = this.model_map[obj._type];
		// 		obj = new Model(obj);
		// 	}
		// 	if(obj instanceof APIEntity && obj.model) {
		// 		obj.model.store(obj);
		// 	}
		// 	return obj;
		// };

		return APIModelFactory;
	}
]);
})(module);
