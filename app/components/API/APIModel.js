'use strict';


var module = angular.module('APIModel', [
]);

module.provider('APIURL', function APIURLProvider() {
    var self = this;
    this.url = "";
    this.$get = function(){return self.url;};
});

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
            if(this.id) {
                return this.model.update(this.id, this);
            } else {
                return this.model.save(this);
            }
        };
        BaseAPIEntity.prototype.$reload = function() {
            return this.model.reload(this.id);
        };
        return BaseAPIEntity;
    }
]);


module.factory('APIInterface', ['$http', 'APIURL', 'BaseAPIEntity',
    function($http, APIURL, BaseAPIEntity) {
        function APIInterface() {
            this.model_map = {};
        }

        APIInterface.prototype.registerModel = function(key, model) {
            this.model_map[key] = model;
        };
        APIInterface.prototype.getModel = function(key) {
            if(!this.model_map[key]) {
                throw 'Unknown model: ' + key;
            } else {
                return this.model_map[key];
            }
        };

        APIInterface.prototype.parse = function(obj) {
            var self = this;
            if(_.isArray(obj)) {
                return _.map(obj, _.bind(this.parse, this));
            } else if(!(obj instanceof BaseAPIEntity) && obj._type && this.getModel(obj._type)) {
                _.forOwn(obj, function(v, k) {
                    if(_.isObject(v) && (v._type || _.isArray(v))) {
                        obj[k] = self.parse(v);
                    }
                });
                return this.getModel(obj._type).create(obj);
            }
            return obj;
        };
        function unparse(obj, notroot) {
            if(!_.isObject(obj)) {
                return obj;
            } else if(!!notroot && obj.id && obj instanceof BaseAPIEntity) {
                return obj.id;
            } else if(_.isArray(obj)){
                return _.map(obj, unparse);
            } else {
                return _.mapValues(obj, unparse);
            }
        }
        APIInterface.prototype.unparse = function(o) {return unparse(o, false);};
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

        APIInterface.prototype.setBar = function(bar) {
            this.bar = bar;
        };
        APIInterface.prototype.getBar = function() {
            return this.bar;
        };
        APIInterface.prototype.request = function(req) {
            var self = this;
            req.data = this.unparse(req.data);
            req.url = APIURL + ((req.url && req.url.charAt(0) !== "/") ? "/" : "") + req.url; // TODO: use correct bar
            req.url += (req.url.charAt(-1) === '/' || req.url.indexOf("?") !== -1 ? "" : "/");
            return $http(req).then(function(data) {
                return self.parse(data.data);
            });
        };
        return new APIInterface();
    }
]);


module.factory('MemoryEntityStore', [
    function() {
        function MemoryEntityStore(broadcast) {
            // Maps entity id with entity object
            this.entity_map = {};
            // Stores entity objects; live array
            this.entity_array = [];
            this._broadcast = broadcast;
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
                this._broadcast("add", obj);
                console.log(obj._type+'('+obj.id+')', obj);
            }
            obj = this.get(id);
            return obj;
        };
        MemoryEntityStore.prototype.add = MemoryEntityStore.prototype.create;
        MemoryEntityStore.prototype.update = function(id, obj) {
            if(this.get(id)) {
                var orig = this.get(id);
                if(orig !== obj) {
                    orig.$update(obj);
                    this._broadcast("update", orig);
                    console.log(obj._type+'('+id+')', obj);
                }
                return orig;
            } else {
                return this.create(obj);
            }
        };
        MemoryEntityStore.prototype.delete = function(id, error) {
            if(this.get(id)) {
                this.update(id, {id:id, _error:error || 'object removed'});
                this._broadcast("remove", this.get(id));
                delete this.entity_map[id];
                var index = _.sortedIndex(this.entity_array, {'id': id}, "id");
                if(this.entity_array[index].id === id) {
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
            this._broadcast("clear");
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


module.factory('APIModel', ['BaseAPIEntity', 'APIInterface', 'MemoryEntityStore', 'RemoteEntityStore', '$q', '$rootScope',
    function(BaseAPIEntity, APIInterface, MemoryEntityStore, RemoteEntityStore, $q, $rootScope) {
        function addNonEnumerableProperty(obj, key, value) {
            Object.defineProperty(obj, key, {
                configurable: true, enumerable: false,
                writable: true, value: value
            });
        }

        function APIModel(config) {
            var self = this;
            this.url = config.url;
            this.model_type = config.type;
            this.structure = config.structure || {};
            this.methods = config.methods || {};
            this.hooks = config.hooks || {};

            this.memory_store = new MemoryEntityStore(function(name, obj) {
                if(self.hooks[name]) {
                    self.hooks[name].call(obj);
                }
                $rootScope.$broadcast("api.model."+self.model_type.toLowerCase()+"."+name, obj);
                var all = self.all();
                $rootScope.$broadcast("api.model."+self.model_type.toLowerCase()+".*", all);
            });
            this.remote_store = new RemoteEntityStore(this.url);
            this.memory_store.all().$reload = _.bind(this.reload, this); // TODO: temporary

            APIInterface.registerModel(this.model_type, this);

            APIModel.createEntityClass.call(this, this.structure);
            APIModel.addMethods.call(this, this.methods);
        }

        APIModel.createEntityClass = function(structure) {
            var self = this;
            this.APIEntity = function APIEntity(obj){
                obj = obj || {};
                _.forOwn(structure, function(type, key) {
                    // var path = key.split(".");
                    var v = obj[key];
                    if(v !== undefined) {
                        obj[key] = APIInterface.getModel(type).get(v);
                    }
                });
                BaseAPIEntity.call(this, obj);
            };
            this.APIEntity.prototype = new BaseAPIEntity();
            this.APIEntity.prototype._type = this.model_type;
            // Prevents infinite recursion in searches
            addNonEnumerableProperty(this.APIEntity.prototype, 'model', self);
        };

        APIModel.addMethods = function(methods) {
            var self = this;
            _.forOwn(methods, function(method, key) {
                if(_.isFunction(method)) {
                    self.APIEntity.prototype[key] = method;
                } else {
                    _.defaults(method, {linkResult: true});
                    var obj = method.static ? self : self.APIEntity.prototype;
                    addNonEnumerableProperty(obj, key, function() {
                        var self_entity = this;
                        function request(data) {
                            var req = _.omit(method, ["static", "linkResult"]);
                            if(req.url && req.url.charAt(0) !== "/") {
                                req.url = self.url + (method.static ? "" : "/" + self_entity.id) + "/" + req.url;
                            }
                            if(!method.static) {
                                req.data = data || req.data || self_entity;
                            }
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
                    });
                }
            });
        };


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
                        self.memory_store.delete(id, error); // TODO: always delete on error ?
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
        APIModel.prototype.all = function() {
            return this.memory_store.all();
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
