'use strict';


var module = angular.module('APIInterface', [
]);


module.factory('BaseAPIEntity', [
    function() {
        function BaseAPIEntity(obj){
            if(obj) {
                this.$update(obj);
            }
        }
        BaseAPIEntity.prototype.$update = function(obj) {
            var self = this;
            _.forOwn(this, function(v, k) {
                delete self[k];
            });
            _.assign(this, obj);
        };
        BaseAPIEntity.prototype.$save = function() {
            this.model.save(this.id);
        };
        return BaseAPIEntity;
    }
]);


module.factory('APIInterface', ['$http', 'BaseAPIEntity',
    function($http, BaseAPIEntity) {
        function APIInterface() {
            this.model_map = {};
        }

        APIInterface.prototype.registerModel = function(key, model) {
            this.model_map[key] = model;
        };
        APIInterface.prototype.getModel = function(key) {
            return this.model_map[key];
        };

        APIInterface.prototype.parse = function(obj) {
            if(_.isArray(obj)) {
                return _.map(obj, _.bind(this.parse, this));
            } else if(!(obj instanceof BaseAPIEntity) && obj._type && this.getModel(obj._type)) {
                return this.getModel(obj._type).create(obj);
            }
            return obj;
        };
        APIInterface.prototype.unParse = function(obj) {
            return _.omit(obj, ['model']);
        };

        APIInterface.prototype.request = function(req) {
            var self = this;
            if(req.data instanceof BaseAPIEntity) {
                req.data = this.unparse(req.data);
            }
            req.url = "/../../bars-symfony/web/avironjone/" + req.url; // TODO: prepend /api prefix
            return $http(req).then(function(data) {
                return self.parse(data.data);
            });
        };
        return new APIInterface();
    }
]);


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

module.factory('RemoteEntityStore', ['APIInterface',
    function (APIInterface) {
        function RemoteEntityStore(url) {
            this.url = url;
        }
        RemoteEntityStore.prototype.get = function(id) {
            return APIInterface.request({method: "GET", url: this.url + "/" + id});
        };
        RemoteEntityStore.prototype.all = function() {
            return APIInterface.request({method: "GET", url: this.url});
        };
        RemoteEntityStore.prototype.create = function(obj) {
            return APIInterface.request({method: "POST", url: this.url, data: obj});
        };
        RemoteEntityStore.prototype.update = function(id, obj) {
            return APIInterface.request({method: "PUT", url: this.url + "/" + id, data: obj});
        };
        RemoteEntityStore.prototype.delete = function(id) {
            return APIInterface.request({method: "DELETE", url: this.url + "/" + id});
        };
        return RemoteEntityStore;
    }
]);


module.factory('APIModel', ['BaseAPIEntity', 'APIInterface', 'MemoryEntityStore', 'RemoteEntityStore',
    function(BaseAPIEntity, APIInterface, MemoryEntityStore, RemoteEntityStore) {
        function APIModel(config) {
            this.url = config.url;
            this.model_type = config.type;
            config.structure = config.structure || {};
            config.methods = config.methods || {};

            this.memory_store = new MemoryEntityStore();
            this.remote_store = new RemoteEntityStore(this.url);

            APIInterface.registerModel(config.type, this);

            var self = this;
            this.APIEntity = function(obj){
                BaseAPIEntity.call(this, obj);
            };
            this.APIEntity.prototype = new BaseAPIEntity();
            this.APIEntity.prototype.model = this;
            this.APIEntity.prototype._type = config.type;

            _.forOwn(config.structure, function(type, key) {
                Object.defineProperty(self.APIEntity.prototype, key, {
                    configurable: true,
                    enumerable: false,
                    get: function() {
                        return APIInterface.getModel(type).get(this[key+"_id"]);
                    },
                    set: function(v) {
                        if(!v.id) {
                            console.log("Warning: affecting an object without id to navigation property", key, "of entity", this,".\nRelationship won't be saved");
                        }
                        this[key+"_id"] = v.id;
                    }
                });
            });

            _.forOwn(config.methods, function(method, key) {
                var obj = method.static ? self : self.APIEntity.prototype;
                Object.defineProperty(obj, key, {
                    configurable: true,
                    enumerable: false,
                    writable: true,
                    value: function() {
                        function request() {
                            var req = _.omit(method, ["static", "type"]);
                            if(req.url && req.url.charAt(0) == "/") {
                                req.url = self.url + req.url; // TODO
                            }
                            req.data = req.data || this;
                            return APIInterface.request(req);
                        }
                        return request(); // TODO: wrapper function
                    }
                });
            });

        }

        APIModel.prototype.create = function(obj) {
            return new this.APIEntity(obj);
        };
        APIModel.prototype.get = function(id) {
            if(!this.memory_store.get(id)) {
                var self = this;
                var obj = this.create({id: id});
                obj = this.memory_store.create(obj);
                var hadPromise = !!obj.$promise;
                obj.$promise = this.remote_store.get(id)
                    .then(function(obj) {
                        if(!hadPromise) {
                            delete obj.$promise;
                        }
                        return self.memory_store.update(id, obj);
                    })
                    .catch(function(error) {
                        self.memory_store.update(id, {});
                        self.memory_store.delete(id);
                        return error;
                    });
            }
            return this.memory_store.get(id);
        };
        APIModel.prototype.all = function() {
            return this.memory_store.all();
        };
        APIModel.prototype.store = function(obj) {
            var self = this;
            return this.remote_store.create(obj)
                .then(function(obj) {
                    return self.memory_store.create(obj);
            });
        };
        APIModel.prototype.update = function(id, obj) {
            var self = this;
            this.memory_store.update(id, obj);
            return this.remote_store.update(id, obj)
                .then(function(obj) {
                    return self.memory_store.update(id, obj);
            });
        };
        APIModel.prototype.delete = function(id) {
            var self = this;
            return this.remote_store.delete(id)
                .then(function() {
                    self.memory_store.delete(id);
            });
        };

        APIModel.prototype.init = function() {
            var self = this;
            this.remote_store.all()
                .then(function(array) {
                    _.each(array, function(o) {
                        self.memory_store.update(o.id, o);
                    });
            });
        };

        return APIModel;
    }
]);





























// var module = angular.module('APIModel', [
// ]);


// (function(module){
// module.factory('MemoryEntityStore', [ // TODO: Use promises in all entity stores
//     function() {
//         function MemoryEntityStore() {
//             // Maps entity id with entity object
//             this.entity_map = {};
//             // Stores entity objects; live array
//             this.entity_array = [];
//         }
//         MemoryEntityStore.prototype.get = function(id) {
//             return this.entity_map[id];
//         };
//         MemoryEntityStore.prototype.all = function() {
//             return this.entity_array;
//         };
//         MemoryEntityStore.prototype.create = function(obj) {
//             var id = obj.id;
//             if(id && !this.get(id)) {
//                 this.entity_map[id] = obj;
//                 var index = _.sortedIndex(this.entity_array, {'id': id}, "id");
//                 this.entity_array.splice(index, 0, obj);
//             }
//             return this.get(id);
//         };
//         MemoryEntityStore.prototype.update = function(id, obj) {
//             if(this.get(id)) {
//                 var orig = this.get(id);
//                 if(orig !== obj) {
//                     // _.forOwn(orig, function(v, k) {
//                     //  delete orig[k];
//                     // });
//                     // _.assign(orig, obj);
//                     orig.$update(obj);
//                 }
//                 return orig;
//             } else {
//                 return this.create(obj);
//             }
//         };
//         MemoryEntityStore.prototype.delete = function(id) {
//             if(this.get(id)) {
//                 delete this.entity_map[id];
//                 var index = _.sortedIndex(this.entity_array, {'id': id}, "id");
//                 if(this.entity_array[index].id == id) {
//                     this.entity_array.splice(index, 1);
//                 }
//             }
//             return null;
//         };
//         return MemoryEntityStore;
//     }
// ]);

// module.factory('RemoteCRUDEntityStore', ['$http',
//     function ($http) {
//         function getData(data) {
//             data.data.$response = data;
//             return data.data;
//         }

//         function RemoteCRUDEntityStore(url) {
//             this.url = url;
//         }
//         RemoteCRUDEntityStore.prototype.get = function(id) {
//             return $http.get(this.url + "/" + id).then(getData);
//         };
//         RemoteCRUDEntityStore.prototype.all = function() {
//             return $http.get(this.url).then(getData);
//         };
//         RemoteCRUDEntityStore.prototype.create = function(obj) {
//             return $http.post(this.url, obj).then(getData);
//         };
//         RemoteCRUDEntityStore.prototype.update = function(id, obj) {
//             return $http.put(this.url + "/" + id, obj).then(getData);
//         };
//         RemoteCRUDEntityStore.prototype.delete = function(id) {
//             return $http.delete(this.url + "/" + id).then(getData);
//         };
//         return RemoteCRUDEntityStore;
//     }
// ]);

// module.factory('TransformerEntityStoreDecorator', [
//     function() {
//         function applyInPromise(f, o) {
//             if(angular.isFunction(o.then)) {
//                 return o.then(f);
//             } else {
//                 return f(o);
//             }
//         }

//         function TransformerEntityStoreDecorator (transformer, store) {
//             this.transformer = transformer;
//             this.store = store;
//         }
//         TransformerEntityStoreDecorator.prototype.get = function(id) {
//             var ret = this.store.get(id);
//             return applyInPromise(this.transformer.transform, ret);
//         };
//         TransformerEntityStoreDecorator.prototype.all = function() {
//             var ret = this.store.all();
//             return applyInPromise(this.transformer.transform, ret);
//         };
//         TransformerEntityStoreDecorator.prototype.create = function(obj) {
//             obj = this.transformer.reverseTransform(obj);
//             var ret = this.store.create(obj);
//             return applyInPromise(this.transformer.transform, ret);
//         };
//         TransformerEntityStoreDecorator.prototype.update = function(id, obj) {
//             obj = this.transformer.reverseTransform(obj);
//             var ret = this.store.update(id, obj);
//             return applyInPromise(this.transformer.transform, ret);
//         };
//         TransformerEntityStoreDecorator.prototype.delete = function(id) {
//             var ret = this.store.delete(id);
//             return applyInPromise(this.transformer.transform, ret);
//         };
//         return TransformerEntityStoreDecorator;
//     }
// ]);

// module.factory('CachedRemoteEntityStoreDecorator', ['$q',
//     function ($q) {
//         function CachedRemoteEntityStoreDecorator(factory, local_store, remote_store) {
//             this.factory = factory;
//             this.local_store = local_store;
//             this.remote_store = remote_store;
//         }
//         CachedRemoteEntityStoreDecorator.prototype.get = function(id) {
//             if(!this.local_store.get(id)) {
//                 var o = this.factory.create();
//                 o.id = id;
//                 o = this.local_store.create(o);
//                 var self = this;
//                 var hadPromise = !!o.$promise;
//                 o.$promise = this.remote_store.get(id)
//                     .then(function(obj) {
//                         if(!hadPromise) {
//                             delete o.$promise;
//                         }
//                         return self.local_store.update(obj.id, obj);
//                     }, function(error) {
//                         self.local_store.delete(id);
//                         return error;
//                     });
//             }
//             return this.local_store.get(id);
//         };
//         CachedRemoteEntityStoreDecorator.prototype.all = function() {
//             var self = this;
//             var arr = self.local_store.all();
//             var hadPromise = !!arr.$promise;
//             arr.$promise = this.remote_store.all()
//                 .then(function(array) {
//                     _.each(array, function(o) {
//                         self.local_store.update(o.id, o);
//                     });
//                     if(!hadPromise) {
//                         delete arr.$promise;
//                     }
//                     return arr;
//             });
//             return arr;
//         };
//         CachedRemoteEntityStoreDecorator.prototype.create = function(obj) {
//             var self = this;
//             return this.remote_store.create(obj)
//                 .then(function(obj) {
//                     return self.local_store.create(obj);
//             });
//         };
//         CachedRemoteEntityStoreDecorator.prototype.update = function(id, obj) {
//             var self = this;
//             this.local_store.update(id, obj);
//             return this.remote_store.update(id, obj)
//                 .then(function(obj) {
//                     return self.local_store.update(id, obj);
//             });
//         };
//         CachedRemoteEntityStoreDecorator.prototype.delete = function(id) {
//             var self = this;
//             return this.remote_store.delete(id)
//                 .then(function() {
//                     self.local_store.delete(id);
//             });
//         };
//         return CachedRemoteEntityStoreDecorator;
//     }
// ]);

// module.factory('BaseAPIEntity', [
//     function() {
//         function BaseAPIEntity(){
//         }
//         BaseAPIEntity.prototype.$update = function(obj) {
//             var self = this;
//             _.forOwn(this, function(v, k) {
//                 delete self[k];
//             });
//             _.assign(this, obj);
//         };
//         BaseAPIEntity.prototype.$save = function() {
//             this.model.save(this.id);
//         };
//         Object.defineProperty(BaseAPIEntity, "model", {
//             configurable: true,
//             enumerable: false,
//             writable: true
//         });
//         return BaseAPIEntity;
//     }
// ]);

// module.factory('APIModel', ['BaseAPIEntity', '$http',
//     function(BaseAPIEntity, $http) {
//         function APIModel(model_type, entity_store, repository, structure, methods) {
//             this.model_type = model_type;
//             this.entity_store = entity_store;
//             this.repository = repository;

//             var self = this;
//             this.APIEntity = function(){};
//             this.APIEntity.prototype = new BaseAPIEntity();

//             _.forOwn(structure, function(type, key) {
//                 Object.defineProperty(this.APIEntity.prototype, key, {
//                     configurable: true,
//                     enumerable: false,
//                     get: function() {
//                         return self.repository.get(type).get(this[key+"_id"]);
//                     },
//                     set: function(v) {
//                         this[key+"_id"] = v.id;
//                     }
//                 });
//             });

//             _.forOwn(methods, function(method, key) {
//                 var obj = method.static ? self : self.APIEntity.prototype;
//                 Object.defineProperty(obj, key, {
//                     configurable: true,
//                     enumerable: false,
//                     writable: true,
//                     value: function() {
//                         function request() {
//                             var req = _.omit(method, ["static", "type"]);
//                             if(req.url && req.url.charAt(0) == "/") {
//                                 req.url = self.url + req.url; // TODO
//                             }
//                             req.data = req.data || this;
//                             return $http(req).then(_.property("data"));
//                         }

//                     }
//                 });
//             });

//         }
//         APIModel.prototype.create = function(obj) {
//             var self = this;
//             var entity = new BaseAPIEntity();
//             entity.model = this;


//             entity._type = this.model_type;
//             if(obj) {
//                 entity.$update(obj);
//             }
//             return entity;
//         };
//         APIModel.prototype.store = function(obj) {
//             return this.entity_store.create(obj);
//         };
//         APIModel.prototype.get = function(id) {
//             return this.entity_store.get(id);
//         };
//         APIModel.prototype.all = function() {
//             return this.entity_store.all();
//         };
//         APIModel.prototype.update = function(obj) {
//             return this.entity_store.update(obj.id, obj);
//         };
//         APIModel.prototype.delete = function(id) {
//             return this.entity_store.delete(id);
//         };
//         return APIModel;
//     }
// ]);

// module.factory('APIModelRepository', ['APIModel', 'BaseAPIEntity', 'MemoryEntityStore', 'RemoteCRUDEntityStore', 'TransformerEntityStoreDecorator', 'CachedRemoteEntityStoreDecorator',
//     function (APIModel, BaseAPIEntity, MemoryEntityStore, RemoteCRUDEntityStore, TransformerEntityStoreDecorator, CachedRemoteEntityStoreDecorator) {
//         var APIModelRepository = {};

//         APIModelRepository.model_map = {};

//         APIModelRepository.create = function(config) {
//             var local_store = new MemoryEntityStore();
//             var remote_store = new RemoteCRUDEntityStore(config.url);
//             remote_store = new TransformerEntityStoreDecorator({
//                     transform: _.bind(this.parse, this),
//                     reverseTransform: function(data) {
//                         return _.omit(data, ['model']);
//                     }
//                 },
//                 remote_store);
//             var entity_factory = {};
//             var store = new CachedRemoteEntityStoreDecorator(entity_factory, local_store, remote_store);

//             var model = new APIModel(config.type, store, this, config.structure, config.methods);
//             entity_factory.create = _.bind(model.create, model); // TODO: ugly
//             if(config.type) {
//                 this.model_map[config.type] = model;
//             }
//             return model;
//         };

//         APIModelRepository.get = function(type) {
//             return this.model_map[type];
//         };

//         APIModelRepository.parse = function(obj) {
//             if(_.isArray(obj)) {
//                 obj = _.map(obj, _.bind(this.parse, this));
//             } else if(!(obj instanceof BaseAPIEntity) && obj._type && this.get(obj._type)) {
//                 var model = this.get(obj._type);
//                 obj = model.create(obj);
//             }
//             return obj;
//         };

//         return APIModelRepository;
//     }
// ]);
// })(module);
