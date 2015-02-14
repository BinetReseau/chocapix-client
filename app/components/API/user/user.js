'use strict';

angular.module('bars.api.user', [
    'APIModel'
    ])

.factory('api.models.user', ['APIModel', 'APIInterface', 
    function(APIModel, APIInterface) {
        var model = new APIModel({
                url: 'user',
                type: "User",
                methods: {
                    'me': {url: 'me', static: true},
                }
            });

        model.changePwd = function(oldpwd, newpwd) {
            return APIInterface.request({
                'url': 'user/change_password',
                'method': 'PUT',
                'params': {'old_password': oldpwd, 'password': newpwd}
            });
        };

        return model;
    }])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('bar.user', {
            url: "/user",
            abstract: true,
            template:'<ui-view/>'
        })
        .state('bar.user.details', {
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

.directive('barsUser', function() {
    return {
        restrict: 'E',
        scope: {
            user: '=user',
            bar: '=bar_'
        },
        templateUrl: 'components/API/user/directive.html'
    };
})
;
