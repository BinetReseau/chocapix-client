'use strict';

angular.module('bars.api.bar', [
    'APIModel'
    ])

.factory('api.models.bar', ['APIModel',
    function(APIModel) {
        return new APIModel({
                url: 'bar',
                type: "Bar",
                structure: {},
                methods: {}
            });
    }])
;
