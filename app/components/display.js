'use strict';

angular.module('bars.filters', [])
    .filter('affd', function() { // displays d' or de
        return function(text) {
            if (/^[aeiouy]/i.test(text)) {
                return "d'";
            } else {
                return "de ";
            }
        };
    })
    .filter('affs', function() { // displays plurial or singular
        return function(text, n) {
            n = n >= 0 ? n : -n;
            if (n >= 2) {
                return text + "s";
            } else {
                return text;
            }
        };
    });
