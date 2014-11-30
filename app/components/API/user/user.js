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

.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('bar.user', {
            url: "/user",
            abstract: true,
            template:'<ui-view/>'
        })
        .state('bar.user.detail', {
            url: "/:id",
            resolve:{
                account: ['APIInterface', 'api.models.account', '$stateParams',
                    function(APIInterface, Account, $stateParams) {
                        return APIInterface.request({
                            method: "GET",
                            url:"account/?bar="+$stateParams.bar+"&owner="+$stateParams.id
                        }).then(function(o) {
                            return o[0];
                        });
                }]
            },
            controller: ['$state', 'account', function($state, account){
                $state.go('bar.account.details', {'id':account.id});
                }]
        });
}])
;
