'use strict';

angular.module('bars.api.suggesteditem', [
    'APIModel'
    ])

.factory('api.models.suggesteditem', ['APIModel', 'APIInterface', 'auth.user',
    function(APIModel, APIInterface, AuthUser) {
        var model = new APIModel({
                url: 'suggesteditem',
                type: "SuggestedItem",
                structure: {
                    'bar': 'Bar',
                    'voters_list.*': 'User'
                },
                methods: {
                    'vote': {method:'POST', url: 'vote', linkResult: true},
                    'unvote': {method:'POST', url: 'unvote', linkResult: true},
                    'votedBy': function(user) {
                        return _.some(this.voters_list, {id: user.id});
                    },
                    'votedByCurrentUser': function() {
                        return AuthUser.user && this.votedBy(AuthUser.user);
                    }
                }
            });
        return model;
    }
])
;
