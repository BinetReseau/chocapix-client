'use strict';

var module = angular.module('APIModel', [
]);


(function(module){
module.factory('MemoryEntityStore', [ // TODO: Use promises all entity stores
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
		function RemoteCRUDEntityStore(url) {
			this.url = url;
		}
		RemoteCRUDEntityStore.prototype.get = function(id) {
			return $http.get(this.url + "/" + id).then(getData);
		};
		RemoteCRUDEntityStore.prototype.all = function() {
			return $http.get(this.url).then(getData);
		};
		RemoteCRUDEntityStore.prototype.create = function(obj) {
			return $http.post(this.url, obj).then(getData);
		};
		RemoteCRUDEntityStore.prototype.update = function(id, obj) {
			return $http.put(this.url + "/" + id, obj).then(getData);
		};
		RemoteCRUDEntityStore.prototype.delete = function(id) {
			return $http.delete(this.url + "/" + id).then(getData);
		};
		return RemoteCRUDEntityStore;
	}
]);

module.factory('TransformerEntityStoreDecorator', [
	function() {
		function applyInPromise(f, o) {
			if(angular.isFunction(o.then)) {
				return o.then(f);
			} else {
				return f(o);
			}
		}

		function TransformerEntityStoreDecorator (transformer, store) {
		    this.transformer = transformer;
		    this.store = store;
		}
		TransformerEntityStoreDecorator.prototype.get = function(id) {
			var ret = this.store.get(id);
			return applyInPromise(this.transformer.transform, ret);
		};
		TransformerEntityStoreDecorator.prototype.all = function() {
			var ret = this.store.all();
			return applyInPromise(this.transformer.transform, ret);
		};
		TransformerEntityStoreDecorator.prototype.create = function(obj) {
			obj = this.transformer.reverseTransform(obj);
			var ret = this.store.create(obj);
			return applyInPromise(this.transformer.transform, ret);
		};
		TransformerEntityStoreDecorator.prototype.update = function(id, obj) {
			obj = this.transformer.reverseTransform(obj);
			var ret = this.store.update(id, obj);
			return applyInPromise(this.transformer.transform, ret);
		};
		TransformerEntityStoreDecorator.prototype.delete = function(id) {
			var ret = this.store.delete(id);
			return applyInPromise(this.transformer.transform, ret);
		};
		return TransformerEntityStoreDecorator;
	}
]);

module.factory('CachedRemoteEntityStoreDecorator', ['$q',
	function ($q) {
		function CachedRemoteEntityStoreDecorator(factory, local_store, remote_store) {
			this.factory = factory;
			this.local_store = local_store;
			this.remote_store = remote_store;
		}
		CachedRemoteEntityStoreDecorator.prototype.get = function(id) {
			if(!this.local_store.get(id)) {
				var o = this.factory.create();
				o.id = id;
				o = this.local_store.create(o);
				var self = this;
				var hadPromise = !!o.$promise;
				o.$promise = this.remote_store.get(id)
					.then(function(obj) {
						if(!hadPromise) {
							delete o.$promise;
						}
						return self.local_store.update(obj.id, obj);
					}, function(error) {
						self.local_store.delete(id);
						return error;
					});
			}
			return this.local_store.get(id);
		};
		CachedRemoteEntityStoreDecorator.prototype.all = function() {
			var self = this;
			var arr = self.local_store.all();
			var hadPromise = !!arr.$promise;
			arr.$promise = this.remote_store.all()
				.then(function(array) {
					_.each(array, function(o) {
						self.local_store.update(o.id, o);
					});
					if(!hadPromise) {
						delete arr.$promise;
					}
					return arr;
			});
			return arr;
		};
		CachedRemoteEntityStoreDecorator.prototype.create = function(obj) {
			var self = this;
			return this.remote_store.create(obj)
				.then(function(obj) {
					return self.local_store.create(obj);
			});
		};
		CachedRemoteEntityStoreDecorator.prototype.update = function(id, obj) {
			var self = this;
			this.local_store.update(id, obj);
			return this.remote_store.update(id, obj)
				.then(function(obj) {
					return self.local_store.update(id, obj);
			});
		};
		CachedRemoteEntityStoreDecorator.prototype.delete = function(id) {
			var self = this;
			return this.remote_store.delete(id)
				.then(function() {
					self.local_store.delete(id);
			});
		};
		return CachedRemoteEntityStoreDecorator;
	}
]);

module.factory('APIEntity', [
	function() {
		function APIEntity(){
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
		function APIModel(model_type, structure, entity_store, repository) {
			this.model_type = model_type;
			this.structure = structure;
			this.entity_store = entity_store;
			this.repository = repository;
		}
		APIModel.prototype.create = function(obj) {
			var self = this;
			var entity = new APIEntity();
			entity.model = this;

			//_.forOwn(this.structure, function(type, key) {
			//	Object.defineProperty(entity, key, {
			//		configurable: true,
			//		enumerable: false,
			//		get: function() {
			//			return self.repository.get(type).get(this[key+"_id"]);
			//		},
			//		set: function(v) {
			//			this[key+"_id"] = v.id;
			//		}
			//	});
			//});
			entity._type = this.model_type;
			if(obj) {
				entity.$update(obj);
			}
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

module.factory('APIModelRepository', ['APIModel', 'APIEntity', 'MemoryEntityStore', 'RemoteCRUDEntityStore', 'TransformerEntityStoreDecorator', 'CachedRemoteEntityStoreDecorator',
	function (APIModel, APIEntity, MemoryEntityStore, RemoteCRUDEntityStore, TransformerEntityStoreDecorator, CachedRemoteEntityStoreDecorator) {
		var APIModelRepository = {};

		APIModelRepository.model_map = {};

		APIModelRepository.create = function(config) {
			var local_store = new MemoryEntityStore();
			var remote_store = new RemoteCRUDEntityStore(config.url);
			remote_store = new TransformerEntityStoreDecorator({
					transform: _.bind(this.parse, this),
					reverseTransform: function(data) {
						return _.omit(data, ['model']);
					}
				},
				remote_store);
			var entity_factory = {};
			var store = new CachedRemoteEntityStoreDecorator(entity_factory, local_store, remote_store);

			var model = new APIModel(config.type, config.structure, store, this);
			entity_factory.create = _.bind(model.create, model); // TODO: ugly
			if(config.type) {
				this.model_map[config.type] = model;
			}
			return model;
		};

		APIModelRepository.get = function(type) {
			return this.model_map[type];
		};

		APIModelRepository.parse = function(obj) {
			if(_.isArray(obj)) {
				obj = _.map(obj, _.bind(this.parse, this));
			} else if(!(obj instanceof APIEntity) && obj._type && this.get(obj._type)) {
				var model = this.get(obj._type);
				obj = model.create(obj);
			}
			return obj;
		};

		return APIModelRepository;
	}
]);
})(module);
