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
			if(id && !this.entity_map[id]) {
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
				return this.create(id, obj);
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
			// return $http.put(this.url + "/" + id, obj).then(getData);
			return $http.post(this.url + "/" + id, obj).then(getData);
		};
		RemoteCRUDEntityStore.prototype.delete = function(id) {
			return $http.delete(this.url + "/" + id).then(getData);
		};
		return RemoteCRUDEntityStore;
	}
]);

module.factory('CachedRemoteEntityStore', ['$q', 'MemoryEntityStore', 'RemoteCRUDEntityStore',
	function ($q, MemoryEntityStore, RemoteCRUDEntityStore) {
		function CachedRemoteEntityStore(url, dataparser) {
			this.url = url;
			this.local_store = new MemoryEntityStore();
			this.remote_store = new RemoteCRUDEntityStore();
			this.dataparser = dataparser || _.identity;
		}
		CachedRemoteEntityStore.prototype.get = function(id) {
			if(this.local_store.get(id)) {
				return $q.when(this.local_store.get(id));
			} else {
				return this.remote_store.get(id).then(this.dataparser)
					.then(function(obj) {
						return this.local_store.create(obj);
				});
			}
		};
		CachedRemoteEntityStore.prototype.all = function() {
			return this.remote_store.all().then(this.dataparser)
				.then(function(array) {
					_.each(array, function(o) {
						this.local_store.update(o.id, o);
					});
					return this.local_store.all();
			});
		};
		CachedRemoteEntityStore.prototype.create = function(obj) {
			return this.remote_store.create(obj).then(this.dataparser)
				.then(function(obj) {
					return this.local_store.create(obj);
			});
		};
		CachedRemoteEntityStore.prototype.update = function(id, obj) {
			this.local_store.update(id, obj);
			return this.remote_store.update(id, obj).then(this.dataparser)
				.then(function(obj) {
					return this.local_store.update(id, obj);
			});
		};
		CachedRemoteEntityStore.prototype.delete = function(id) {
			return this.remote_store.delete(id).then(this.dataparser)
				.then(function() {
					this.local_store.delete(id);
			});
		};
		return CachedRemoteEntityStore;
	}
]);

module.factory('APIEntity', [
	function() {
		function APIEntity(model){
			this.model = model;
		}
		APIEntity.prototype.$update = function(obj) {
			_.forOwn(this, function(v, k) {
				delete this[k];
			});
			_.assign(this, obj);
		};
		APIEntity.prototype.$save = function() {
			this.model.save(this.id);
		};
		return APIEntity;
	}
]);

module.factory('APIModel', ['APIEntity',
	function(APIEntity) {
		function APIModel(store, structure, model_type) {
			this.store = store;
			this.structure = structure;
			this.model_type = model_type;
		}
		APIModel.prototype.create = function(obj) {
			if(obj === undefined) {
				var entity = new APIEntity(this);
				entity._type = this.model_type;
				return entity;
			} else {
				return this.store.create(obj);
			}
		};
		APIModel.prototype.get = function(id) {
			return this.store.get(id);
		};
		APIModel.prototype.all = function() {
			return this.store.all();
		};
		APIModel.prototype.update = function(obj) {
			this.store.update(obj.id, obj);
		};
		// APIModel.prototype.store = APIModel.prototype.update;
		APIModel.prototype.delete = function(id) {
			return this.store.delete(id);
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
			var model = new APIModel(new EntityStore(url), structure, model_type);
			if(model_type) {
				APIModelFactory.model_map[model_type] = model;
			}
			return model;
		};

		APIModelFactory.parse = function(obj) {
			if(_.isArray(obj)) {
				obj = _.map(obj, _.bind(this.parse, this));
			} else if(!obj instanceof APIEntity && obj._type && this.model_map[obj._type]) {
				var Model = this.model_map[obj._type];
				obj = new Model(obj);
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
