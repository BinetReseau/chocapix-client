'use strict';

angular.module('bars.api.user', [
    'APIModel'
    ])

.factory('api.models.user', ['APIModel',
    function(APIModel) {
        return new APIModel({
                url: 'user',
                type: "User",
                methods: {
                    'me': {url: 'me', static: true},
                }
            });
    }])
;
