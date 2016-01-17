'use strict';

angular.module('bars.api.suggesteditem')

.directive('barsSuggestedItem', function() {
    return {
        restrict: 'E',
        scope: {
            suggesteditem: '=suggesteditem',
        },
        templateUrl: 'components/API/suggesteditem/suggesteditem.directive.html'
    };
})
;
