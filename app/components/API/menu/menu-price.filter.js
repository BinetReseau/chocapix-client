'use strict';

angular.module('bars.api.menu')

// Return menu total price
.filter('menuPrice', function() {
    return function(menu, qty) {
        if (qty === undefined) {
            qty = 1;
        }
        return _.reduce(menu.items, function (total, item) {
            return total + item.sellitem.fuzzy_price*item.qty*qty;
        }, 0);
    };
})
;
