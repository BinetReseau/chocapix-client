'use strict';

angular.module('bars.filters', [])
.filter('formatn', function() { // format a number to be human readable
    return function(n) {
      var negatif = n < 0;
      if (negatif) {
        n *= -1;
      }
      n = Math.round(n*100)/100;
      var nombre = '' + Math.floor(n);
      var retour = '';
      var count = 0;
      for (var i = nombre.length-1 ; i >= 0 ; i--)
      {
        if (count != 0 && count % 3 == 0) {
          retour = nombre[i] + ' ' + retour;
        }
        else {
          retour = nombre[i] + retour;
        }
        count++;
      }
      var decimal = Math.round((n-Math.floor(n))*100)/100;
      if (decimal > 0) {
        decimal = '' + decimal;
        retour = retour + decimal.substring(1);
      }
      if (negatif) {
        retour = "-" + retour;
      }
      return retour;
      };
  })
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
      if (n >= 2) {
        return text + "s";
      } else {
        return text;
      }
    };
  });