'use strict';

angular.module('bars.api.role', [
    'APIModel'
    ])

.factory('api.models.role', ['APIModel', 'APIInterface',
    function(APIModel, APIInterface) {
        var model = new APIModel({
                url: 'role',
                type: "Role",
                structure: {
                    'bar': 'Bar',
                    'user': 'User'
                },
                methods: {}
            });

        model.ofUser = function(user) {
            return APIInterface.request({
                'url': 'role',
                'method': 'GET',
                'params': {user: user}});
        };

        return model;
    }])
;
