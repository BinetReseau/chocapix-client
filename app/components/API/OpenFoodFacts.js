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
    var out = {
        fetch: function (barcode) {
            var url = OFFURL + "/" + barcode + ".json";
            return $http.get(url).then(
                function(result) {
                    if (result.data.status == 0 || result.data.code != barcode) {
                        return null
                    } else {
                        return result;
                    }
                },
                function(result) {
                    return null;
                });
        },
        parse: function (o) {
            return {
                name: o.product.product_name,
                name_plural: o.product.product_name,
                unit: o.product.quantity,
                unit_plural: o.product.quantity
            };
        },
        get: function (barcode) {
            return out.fetch(barcode).then(function (o) {
                if (o) {
                    var infos = out.parse(o.data);
                    return infos;
                } else {
                    return null;
                }
            });
        }
    };
    return out;
}]);
