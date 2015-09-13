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
