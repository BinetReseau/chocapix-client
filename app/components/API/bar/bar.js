'use strict';

angular.module('bars.api.bar', [
    'APIModel'
    ])

.factory('api.models.bar', ['APIModel',
    function(APIModel) {
        return new APIModel({
                url: 'bar',
                type: "Bar",
                structure: {
                    'settings': "BarSettings"
                },
                methods: {
                    'filter': function(s) {
                        return _.deburr(this.id.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1 || _.deburr(this.name.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1;
                    }
                }
            });
    }])
;
