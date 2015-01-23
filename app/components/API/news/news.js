'use strict';

angular.module('bars.api.news', [
    'APIModel'
    ])

.factory('api.models.news', ['APIModel',
    function(APIModel) {
        return new APIModel({
                url: 'news',
                type: "News",
                structure: {
                    'bar': 'Bar',
                    'author': 'User'
                }
                // methods: {
                //     'markDeleted': {method:'PUT', url: 'markDeleted'},
                //     'unMarkDeleted': {method:'PUT', url: 'unMarkDeleted'},
                //     'filter': function(s) {
                //         return !this.deleted && (this.name.toLocaleLowerCase().indexOf(s) > -1 ||
                //             this.keywords.toLocaleLowerCase().indexOf(s) > -1);
                //     }
                // }
            });
    }])
;
