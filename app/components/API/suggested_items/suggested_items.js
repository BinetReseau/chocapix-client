'use strict';

angular.module('bars.api.suggested_items', [
    'APIModel'
    ])

.factory('api.models.suggested_items', ['APIModel', 'APIInterface', 
    function(APIModel, APIInterface) {
        var model = new APIModel({
                url: 'suggested_items',
                type: "SuggestedItem",
                structure: {
                    'bar': 'Bar',
                    'voters_list.*': 'User' //voters_list est un Array dont chaque élément est un User
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
        templateUrl: 'components/API/suggested_items/directive.html', //injecté dans le code HTML de cette page
        controller: ['$scope', 'api.models.suggested_items', 'auth.user', '$state', function($scope, SuggestedItem, AuthUser, $state){
            $scope.more_wished = function(suggested_item) {
                if(!_.some(suggested_item.voters_list, {'id' : AuthUser.user.id})){//si l'utilisateur connecté n'a pas encore voté
                    suggested_item.voters_list.push(AuthUser.user);//ajout l'utilisateur
                    suggested_item.$save();
                }
            };
        }]
    };
})
;
