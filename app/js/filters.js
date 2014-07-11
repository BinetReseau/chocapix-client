'use strict';

angular.module('bars.filters', [])
  .filter('affs', function() {
    return function(text, n) {
      if (n >= 2) {
        return text + "s";
      } else {
        return text;
      }
    };
  });