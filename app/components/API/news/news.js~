'use strict';

angular.module('bars.api.news', [
    'APIModel'
    ])

.factory('api.models.news', ['APIModel', 'APIInterface', 
    function(APIModel, APIInterface) {
        var model = new APIModel({
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
        model.request = function(params) {
            return APIInterface.request({
                'url': 'news',
                'method': 'GET',
                'params': params});
        }
        return model;
    }
])
.directive('barsNews', function() {
    return {
        restrict: 'E',
        scope: {
            news: '=news'
        },
        templateUrl: 'components/API/news/directive.html'
    };
})
;
