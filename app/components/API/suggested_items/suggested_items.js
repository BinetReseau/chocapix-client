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
                addVoteBy: function(user) {
                    this.voters_list.push(user.id);
                    return this.$save();
                },
                addVoteByCurrentUser: function() {
                    return this.addVoteBy(AuthUser.user);
                }
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
            suggesteditem: '=suggesteditem' //l'objet suggesteditem, définit dans l'élément parent
        },
        templateUrl: 'components/API/suggested_items/directive.html' //injecté dans le code HTML de cette page
    };
})
;
