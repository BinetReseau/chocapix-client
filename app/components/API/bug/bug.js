'use strict';

angular.module('bars.api.bug', [
    'APIModel'
    ])

.factory('api.models.bug', ['APIModel', 'APIInterface',
    function(APIModel, APIInterface) {
        var model = new APIModel({
                url: 'bugreport',
                type: "BugReport",
                structure: {
                    'bar': 'Bar',
                    'author': 'User'
                }
            });

        return model;
    }])
;
