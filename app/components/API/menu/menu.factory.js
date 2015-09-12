'use strict';

angular.module('bars.api.menu')

.factory('api.models.menu', ['APIModel',
    function(APIModel) {
        var model = new APIModel({
                url: 'menu',
                type: 'Menu',
                structure: {
                    'account': 'Account',
                    'items.*.sellitem': 'SellItem'
                }
            });
        return model;
    }])
;
