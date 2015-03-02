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
})
.filter('abs', function() {
    return Math.abs;
})
.filter('qty', function($locale, numberFilter) {
    var decSep = $locale.NUMBER_FORMATS.DECIMAL_SEP;
    var trailingZerosMiddle = new RegExp("("+decSep+"\\d*?)0+[^1-9]");
    var trailingZerosEnd = new RegExp("("+decSep+"\\d*?)0+$");
    var trailingSep = new RegExp(decSep+'$');

    return function(n, fractionSize) {
        var s = numberFilter(n, fractionSize);
        s = s.replace(trailingZerosMiddle, "$1");
        s = s.replace(trailingZerosEnd, "$1");
        return s.replace(trailingSep, "");
    };
})
.filter('nl2br', function(){
      return function(text) {
           return text ? text.replace(/\n/g, '<br/>') : '';
      };
});
