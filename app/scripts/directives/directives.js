'use strict';

angular.module('bars.directives', [
    ])
.directive('barsFood', function() {
    return {
        restrict: 'E',
        scope: {
            food: '=food',
            unit: '=unit',
            qty: '=qty'
        },
        template: function(elt, attrs) {
            if(attrs.unit === undefined || attrs.qty === undefined) {
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
        }
    };
})
.directive('barsAccount', function() {
    return {
        restrict: 'E',
        scope: {
            account: '=account'
        },
        template: '<a title="En savoir plus sur {{ account.user.name }}" ui-sref="bar.account.detail({ bar: account.bar, id:account.id })">' +
                    '{{ account.user.name }}' +
                '</a>'
    };
});