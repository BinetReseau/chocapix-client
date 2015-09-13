'use strict';

angular.module('bars.api.menu')

.factory('api.models.menu', ['APIModel', 'APIInterface',
    function(APIModel, APIInterface) {
        var model = new APIModel({
                url: 'menu',
                type: 'Menu',
                structure: {
                    'bar': 'Bar',
                    'user': 'User',
                    'items.*.sellitem': 'SellItem'
                },
                methods: {
                    'filter': function (s) {
                        return s.length != 1 && (_.deburr(this.name.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1);
                    },
                    'updateRank': function () {
                        this.urank = _.reduce(this.items, function (total, item) {
                            return total + item.sellitem.urank;
                        }, 0);
                        if (this.items.length > 0) {
                            this.urank = this.urank/this.items.length;
                        }
                    }
                }
            });
        model.request = function(params) {
            return APIInterface.request({
                'url': 'menu',
                'method': 'GET',
                'params': params});
        };
        return model;
    }])
;
