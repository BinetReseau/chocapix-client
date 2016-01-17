'use strict';

angular.module('bars.api.suggesteditem')

.directive('barsSuggestions', function() {
    return {
        restrict: 'E',
        scope: {
            suggestions: '=',
        },
        templateUrl: 'components/API/suggesteditem/suggestions.directive.html',
        controller: ['$scope', '$timeout', 'auth.user', 'api.models.suggesteditem', function($scope, $timeout, AuthUser, SuggestedItem) {
            $scope.suggestion = {name: "", added: false};

            $scope.saveSuggestedItem = function(suggestion_name) {
                if (!suggestion_name) {
                    return;
                }
                var suggested_item = SuggestedItem.create();
                suggested_item.name = suggestion_name;

                // Verify that the new suggestion doesn't already exist
                if (_.find($scope.suggestions, function (item) {
                    return _.deburr(item.name.toLocaleLowerCase()) === _.deburr(suggested_item.name.toLocaleLowerCase());
                })) {
                    $scope.suggestion.added = true;
                    $timeout(function () {
                        $scope.suggestion.added = false;
                    }, 2500);
                } else {
                    suggested_item.$save();
                }

                $scope.suggestion.name = "";
            };

            $timeout(function() {
                var $div = $('#lsuggested');
                $div.on('mousewheel DOMMouseScroll', function(e) {
                    var d = e.originalEvent.wheelDelta || -e.originalEvent.detail,
                        dir = d > 0 ? 'up' : 'down',
                        stop = (dir == 'up' && this.scrollTop == 0) || (dir == 'down' && this.scrollTop == this.scrollHeight-this.offsetHeight);
                    stop && e.preventDefault();
                });
            }, 500);
        }]
    };
});
