'use strict';

angular.module('bars.api.barsettings', [
    'APIModel'
    ])

.factory('api.models.barsettings', ['APIModel',
    function(APIModel) {
        return new APIModel({
                url: 'barsettings',
                type: "BarSettings",
                structure: {
                    'bar': 'Bar'
                },
                methods: {}
            });
    }])
;
