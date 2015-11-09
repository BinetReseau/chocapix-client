'use strict';

angular.module('bars.storage', [
    'ngStorage'
])

.factory('storage.bar',
    ['$localStorage',
    function ($localStorage) {
        return {
            bar: null,
            setBar: function (bar) {
                this.bar = bar;
                if (!$localStorage[bar]) {
                    $localStorage[bar] = {};
                }
            },
            get: function (key) {
                if (!$localStorage[this.bar][key]) {
                    $localStorage[this.bar][key] = {};
                }
                return $localStorage[this.bar][key];
            }
        };
    }
]);
