'use strict';

angular.module('bars.api.bar', [
    'APIModel'
    ])

.factory('api.models.bar', ['APIModel', 'APIInterface',
    function(APIModel, APIInterface) {
        return new APIModel({
                url: 'bar',
                type: "Bar",
                structure: {
                    'settings': "BarSettings"
                },
                methods: {
                    'filter': function(s) {
                        return _.deburr(this.id.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1 || _.deburr(this.name.toLocaleLowerCase()).indexOf(_.deburr(s.toLocaleLowerCase())) > -1;
                    },
                    'sellitem_ranking': function(params) {
                        return APIInterface.request({
                            'url': 'bar/' + this.id + '/sellitem_ranking',
                            'method': 'GET',
                            'params': params});
                    }
                }
            });
    }])
;
