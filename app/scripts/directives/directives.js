'use strict';

angular.module('bars.directives', [
    ])
.directive('barsFood', function() {
    return {
        restrict: 'E',
        scope: {
            food: '=food',
            unit: '=?unit',
            qty: '=?qty'
        },
        template: function(elt, attrs) {
            if(!attrs.food) return '';
            if(!attrs.qty) {
                return '<a title="Voir la fiche de cet aliment" ui-sref="bar.food.detail({ bar: food.bar, id:food.id })">' +
                        '{{ food.name }}' +
                    '</a>';
            } else {
                return '{{ qty | number }} ' +
                        '<span ng-if="unit != \'\'">{{ unit }} {{ food.name | affd }}</span>' +
                        '<a title="Voir la fiche de cet aliment" ui-sref="bar.food.detail({ bar: food.bar, id:food.id })">' +
                            '<span ng-if="unit != \'\'">{{ food.name }}</span>' +
                            '<span ng-if="unit == \'\'">{{ food.name | affs:qty }}</span>' +
                        '</a>';
            }
        },
        controller: function($scope){
            $scope.unit = $scope.unit || ($scope.food && $scope.food.unit) || '';
        }
    };
})
.directive('barsAccount', function() {
    return {
        restrict: 'E',
        scope: {
            account: '=account',
            user: "=?user"
        },
        template: '<a title="En savoir plus sur {{ user.name }}" ui-sref="bar.account.detail({ bar: account.bar, id:account.id })">' +
                    '{{ user.name }}' +
                '</a>',
        controller: function($scope){
            $scope.user = $scope.user || ($scope.account && $scope.account.user) || null;
        }
    };
});
