'use strict';

angular.module('bars.api.menu')

.factory('api.models.menu', ['APIModel', 'APIInterface',
    function(APIModel, APIInterface) {
        var model = new APIModel({
                url: 'menu',
                type: 'Menu',
                structure: {
                    'account': 'Account',
                    'items.*.sellitem': 'SellItem'
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
