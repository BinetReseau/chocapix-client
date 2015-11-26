'use strict';

angular.module('bars.api.suggested_items', [
    'APIModel'
    ])

.factory('api.models.suggested_items', ['APIModel', 'APIInterface', 'auth.user',
    function(APIModel, APIInterface, AuthUser) {
        var model = new APIModel({
            url: 'suggested_items',
            type: "SuggestedItem",
            structure: {
                'bar': 'Bar',
                'voters_list.*': 'User' //voters_list est un Array dont chaque élément est un User
            },
            methods: {
                votedBy: function(user) {
                    return _.some(this.voters_list, {id: user.id});
                },
                votedByCurrentUser: function() {
                    return AuthUser.user && this.votedBy(AuthUser.user);
                },
                vote: function() {
                    return APIInterface.request({
                        'url': 'suggested_items/' + this.id + '/vote',
                        'method': 'POST'})
                },
                unvote: function() {
                    return APIInterface.request({
                        'url': 'suggested_items/' + this.id + '/unvote',
                        'method': 'POST',
                        'data': {}});
                },
            }
        });
        model.request = function(params) {
            return APIInterface.request({
                'url': 'suggested_items',
                'method': 'GET',
                'params': params});
        }
        return model;
    }
])
.directive('barsSuggestedItems', function() {//on insère dans les balises <bars:suggested:items> ce qui suit :
    return {
        restrict: 'E',
        scope: {
            suggesteditem: '=suggesteditem', //l'objet suggesteditem, définit dans l'élément parent
        },
        link: function($scope) {
            $scope.vote = function(suggesteditem) {
                console.log('coucou');
                suggesteditem.vote().then(function(suggesteditem) {
                    suggesteditem.$reload();
                });
            };
        
            $scope.unvote = function(suggesteditem) {
                console.log('ok');
                suggesteditem.unvote().then(function(suggesteditem) {
                    suggesteditem.$reload();
                });
            };
        },
        templateUrl: 'components/API/suggested_items/directive.html' //injecté dans le code HTML de cette page
    };
})
;
