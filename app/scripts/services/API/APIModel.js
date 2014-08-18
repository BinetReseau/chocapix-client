'use strict';


var module = angular.module('APIModel', [
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
            this.model.update(this.id, this);
        };
        BaseAPIEntity.prototype.$reload = function() {
            this.model.reload(this.id);
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
        APIInterface.prototype.unparse = function(obj) {
            return _.omit(obj, ['model']);
        };
        APIInterface.prototype.link = function(obj) {
            if(_.isArray(obj)) {
                return _.map(obj, _.bind(this.link, this));
            }
            if(!(obj instanceof BaseAPIEntity)) {
                obj = this.parse(obj);
            }
            if(obj.id && obj instanceof BaseAPIEntity) {
                return obj.model.link(obj);
            }
        };

        APIInterface.prototype.request = function(req) {
            var self = this;
            if(req.data instanceof BaseAPIEntity) {
                req.data = this.unparse(req.data);
            }
            req.url = "/../../bars-symfony/web/avironjone" + ((req.url && req.url.charAt(0) != "/") ? "/" : "") + req.url; // TODO: use correct bar
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
        MemoryEntityStore.prototype.clear = function() {
            // var self = this;
            // _.forOwn(this.entity_map, function(v, k) {
            //     delete self.entity_map[k];
            // });
            this.entity_map = {};
            this.entity_array.splice(0, this.entity_array.length);
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

/**
 * Usage:
 *
 * model = new APIModel({
 *          url: 'account',
 *          type: "Account\\Account",
 *          structure: {
 *              'bar': 'Bar\\Bar'
 *          },
 *          methods: {
 *              'markDeleted': {method:'PUT', url: 'markDeleted', linkResult: true},
 *              'me': {url: '/../nobar/auth/me', static: true}
 *          }
 *      });
 *  }])
 *
 * @param {string} config.url Main url of the model, used for CRUD operations (namely GET url,
 *                            GET url/:id, POST url, PUT url/:id and DELETE url/:id)
 * @param {string} config.type Name of the model. Response objects whose _type property matches
 *                             the model's name will be transformed into corresponding entities
 * @param {object} config.structure Defines the model's relations with other models.
 *                                  Each ($key: $name) pair will add to the model's entities a
 *                                  getter/setter this[$key] that returns the entity with id
 *                                  this[$key + "_id"] from model with name $name;
 * @param {object} config.methods Defines the model's methods. Each ($key: $parameters) pair will
 *                                create a method with name $key according to the given $parameters.
 *
 *         Methods with static:true will be added to the APIModel object, methods without will be
 *         added to the model's entities
 *
 *         Calling a method will make a http request to the given url.
 *         Urls not starting with a "/" will use model.url/url if static, or model.url/:id/url if not.
 *         All urls are relative to the API url.
 *
 *         An entity passed as data will be correctly serialized. An entity returned in the
 *         response will be seserialized.
 *         If linkResult:true (default), the received entities will be linked with the correct model's cache
 *         If a non-static method has no data parameter, the entity will be passed as data.
 */


module.factory('APIModel', ['BaseAPIEntity', 'APIInterface', 'MemoryEntityStore', 'RemoteEntityStore', '$q',
    function(BaseAPIEntity, APIInterface, MemoryEntityStore, RemoteEntityStore, $q) {
        function APIModel(config) {
            this.url = config.url;
            this.model_type = config.type;
            config.structure = config.structure || {};
            config.methods = config.methods || {};

            this.memory_store = new MemoryEntityStore();
            this.remote_store = new RemoteEntityStore(this.url);
            this.memory_store.all().$reload = _.bind(this.reload, this); // TODO: temporary

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
                method.linkResult = method.linkResult === undefined ? true : method.linkResult; // Default to true
                Object.defineProperty(obj, key, {
                    configurable: true,
                    enumerable: false,
                    writable: true,
                    value: function() {
                        var self_entity = this;
                        function request(data) {
                            var req = _.omit(method, ["static", "linkResult"]);
                            if(req.url && req.url.charAt(0) != "/") {
                                req.url = self.url + (method.static ? "" : "/" + self_entity.id) + "/" + req.url;
                            }
                            req.data = data || req.data || self_entity;
                            return APIInterface.request(req);
                        }
                        var promise = request(); // TODO: wrapper function?
                        if(method.linkResult) {
                            promise = promise.then(function(entity) {
                                if(entity instanceof BaseAPIEntity) {
                                    return APIInterface.link(entity);
                                }
                                return entity;
                            });
                        }
                        return promise;
                    }
                });
            });

            this.reload(); // TODO: handle caching correctly
        }

        APIModel.prototype.create = function(obj) {
            return new this.APIEntity(obj);
        };
        APIModel.prototype.get = function(id) {
            if(!this.memory_store.get(id)) {
                var self = this;
                this.link(this.create({id: id}));
                this.remote_store.get(id)
                    .then(function(obj) {
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
        APIModel.prototype.getSync = function(id) {
            if(this.memory_store.get(id)) {
                return $q.when(this.memory_store.get(id));
            } else {
                var self = this;
                return this.remote_store.get(id)
                    .then(function(obj) {
                        return self.memory_store.update(id, obj);
                    });
            }
        };
        APIModel.prototype.reload = function(id) {
            var self = this;
            if(id) {
                return this.remote_store.get(id).then(function(obj) {
                    return self.memory_store.update(id, obj);
                });
            } else {
                return this.remote_store.all().then(function(array) {
                    self.memory_store.clear();
                    _.each(array, function(o) {
                        self.memory_store.update(o.id, o);
                    });
                    return self.memory_store.all();
                });
            }
        };
        APIModel.prototype.all = function() {
            return this.memory_store.all();
        };
        APIModel.prototype.save = function(obj) {
            var self = this;
            return this.remote_store.create(obj)
                .then(function(obj) {
                    return self.memory_store.create(obj);
            });
        };
        APIModel.prototype.link = function(obj) {
            return this.memory_store.update(obj.id, obj);
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

        return APIModel;
    }
]);
