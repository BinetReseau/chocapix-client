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
            var name = o.product.product_name;
            var quantity = o.product.quantity.toLocaleLowerCase();
            var sell_to_buy = 1;
            var is_pack = false;
            var itemqty;

            // On remplace les unités mal formatées
            var runits = {
                'litres': 'l',
                'litre': 'l',
                'kilo-grammes': 'kg',
                'kilo grammes': 'kg',
                'kilo-gramme': 'kg',
                'kilo gramme': 'kg',
                'grammes': 'g',
                'gramme': 'g'
            };
            var ru;
            _.forEach(runits, function (r, o) {
                ru = new RegExp(o, "i");
                quantity = quantity.replace(ru, r);
            });

            // On s'occupe d'abord du cas ou c'est un pack
            // auquel cas la quantity est souvent 6 x 33cl ou 6 * 330 ml
            if (/^[0-9]+ ?x/i.test(quantity)) {
                sell_to_buy = quantity.replace(/^([0-9]+) ?x(.+)$/i, "$1");
                itemqty = quantity.replace(/^([0-9]+) ?x(.+)$/i, "$1");
                unit = quantity.replace(/^([0-9]+) ?x(.+)$/i, "$2").trim();
                is_pack = true;
            } else if (/\*/i.test(quantity)) {
                sell_to_buy = quantity.replace(/^([0-9]+) ?\*(.+)$/i, "$1");
                itemqty = quantity.replace(/^([0-9]+) ?\*(.+)$/i, "$1");
                unit = quantity.replace(/^([0-9]+) ?\*(.+)$/i, "$2").trim();
                is_pack = true;
            } else {
                // Maintenant on va essayer de détecter l'unité
                // parmis la liste suivante
                var units = ['l', 'cl', 'ml', 'kg', 'g', 'mg'];
                var rem, ree, renm, rene;
                var unit = _.find(units, function (u) {
                    rem = new RegExp(" " + u + " ", "i");
                    ree = new RegExp(" " + u + "\$", "i");
                    renm = new RegExp("[0-9]" + u + " ", "i");
                    rene = new RegExp("[0-9]" + u + "\$", "i");
                    return rem.test(quantity) || ree.test(quantity) || renm.test(quantity) || rene.test(quantity);
                });
                var unit_plural = unit;
                // unit contient maintenant l'unité si on en a trouvée une

                // On va essayer de trouver le rapport entre achat et vente
                if (unit) {
                    var rq = new RegExp("^([0-9,.]+) ?" + unit + "$");
                    sell_to_buy = quantity.replace(rq, "$1");

                    // Cas particulier pour 33 cl (= canette)
                    if ((sell_to_buy == "33" && unit == "cl") || (sell_to_buy == "330" && unit == "ml")) {
                        sell_to_buy = "1";
                        unit = "canette";
                        unit_plural = "canettes";
                    }

                }

                var sell_unit = {
                    'kg': {
                        n: 'g',
                        v: '1000'
                    }
                };
                // On se débarasse du 1 dans le cas "1kg" par exemple ou "1 l"
                if (/^1 ?[^0-9]/.test(quantity)) {
                    quantity = quantity.replace(/^1 ?([^0-9,.])/, '$1');
                    if (sell_unit[unit]) {
                        sell_to_buy = sell_unit[unit].v;
                        unit = sell_unit[unit].n;
                        unit_plural = unit;
                    }
                }
            }
            sell_to_buy = parseInt(sell_to_buy);
            console.log(sell_to_buy);
            return {
                sell_name: name,
                sell_name_plural: name,
                name: name + " " + quantity,
                name_plural: name + " " + quantity,
                unit_name: unit,
                unit_name_plural: unit_plural,
                sell_to_buy: sell_to_buy,
                brand: o.product.brands,
                is_pack: is_pack,
                itemqty: itemqty
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
