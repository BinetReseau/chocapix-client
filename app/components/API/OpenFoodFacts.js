'use strict';


var module = angular.module('OpenFoodFacts', [
]);

module.provider('OFFURL', function OFFURLProvider() {
    var self = this;
    this.url = "";
    this.$get = function(){return self.url;};
});

module.factory('OFF', ['$http', 'OFFURL',
function($http, OFFURL) {
    return {
        fetch: function (barcode) {
            var url = OFFURL + "/" + barcode + ".json";
            return $http.get(url).
                success(function(data) {
                    return data;
                }).
                error(function(data) {
                    return null;
                });
        },
        parse: function (o) {
            if (o.status == 0) {
                return null;
            }

            return {
                name: o.product.generic_name,
                name_plural: o.product.generic_name,
                unit: o.product.quantity
            };
        },
        get: function (barcode) {
            return this.parse(this.fetch(barcode));
        }
    };
}]);
