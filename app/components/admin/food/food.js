'use strict';

angular.module('bars.admin.food', [

])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('bar.admin.food', {
        abstract: true,
        url: "/food",
        controller: 'admin.ctrl.food',
        template: '<ui-view />'
    })
        .state('bar.admin.food.add', {
            url: "/add",
            templateUrl: "components/admin/food/add.html",
            controller: 'admin.ctrl.food.add'
        })
        .state('bar.admin.food.regroup', {
            url: "/regroup",
            templateUrl: "components/admin/food/regroup.html",
            controller: 'admin.ctrl.food.regroup',
            resolve: {
                sellitem_list: ['api.models.sellitem', function(SellItem) {
                    return SellItem.all();
                }]
            }
        })
        .state('bar.admin.food.appro', {
            url: "/appro",
            templateUrl: "components/admin/food/appro.html",
            controller: 'admin.ctrl.food.appro'
        })
        .state('bar.admin.food.autoappro', {
            url: "/auto-appro",
            abstract: true,
            template: '<ui-view />'
        })
            .state('bar.admin.food.autoappro.ooshop', {
                url: "/ooshop",
                templateUrl: "components/admin/food/autoappro/ooshop.html",
                controller: 'admin.ctrl.food.autoappro.ooshop'
            })
            .state('bar.admin.food.autoappro.intermarche', {
                url: "/intermarche",
                templateUrl: "components/admin/food/autoappro/intermarche.html",
                controller: 'admin.ctrl.food.autoappro.intermarche'
            })
            .state('bar.admin.food.autoappro.picard', {
                url: "/picard",
                templateUrl: "components/admin/food/autoappro/picard.html",
                controller: 'admin.ctrl.food.autoappro.picard'
            })
            .state('bar.admin.food.autoappro.houra', {
                url: "/houra",
                templateUrl: "components/admin/food/autoappro/houra.html",
                controller: 'admin.ctrl.food.autoappro.houra'
            })
            .state('bar.admin.food.autoappro.chicandrun', {
                url: "/chicandrun",
                templateUrl: "components/admin/food/autoappro/chicandrun.html",
                controller: 'admin.ctrl.food.autoappro.chicandrun'
            })
        .state('bar.admin.food.approhelper', {
            url: "/appro-helper",
            templateUrl: "components/admin/food/approhelper.html",
            controller: 'admin.ctrl.food.approhelper'
        })
        .state('bar.admin.food.inventory', {
            url: "/inventory",
            templateUrl: "components/admin/food/inventory.html",
            controller: 'admin.ctrl.food.inventory'
        })
        .state('bar.admin.food.stockitems_list', {
            url: "/stock-list",
            templateUrl: "components/admin/food/stockitems-list.html",
            controller: 'admin.ctrl.food.stockitems_list',
            resolve: {
                stockitem_list: ['api.models.stockitem', function(StockItem) {
                    return StockItem.all();
                }]
            }
        })
        .state('bar.admin.food.graphs', {
            url: "/graphs",
            templateUrl: "components/admin/food/graphs.html",
            controller: 'admin.ctrl.food.graphs'
        })
    ;
}])

.controller('admin.ctrl.food',
    ['$scope', function ($scope) {
        $scope.admin.active = 'food';
    }]
)
.controller('admin.ctrl.food.add',
    ['$scope',
    function($scope) {
        $scope.origin = {
            callback: function (o) {
                console.log(o);
            }
        };
    }
])
.controller('admin.ctrl.food.regroup',
    ['$scope', 'api.models.sellitem', 'api.models.stockitem', 'api.services.action', 'sellitem_list', 'APIInterface',
    function($scope, SellItem, StockItem, APIAction, sellitem_list, APIInterface) {
        document.getElementById("sellitemNameInput").focus();
        $scope.sell_item = SellItem.create();
        $scope.sellitem_list = sellitem_list;
        $scope.sellitems_grp = [];
        $scope.searchl = "";
        $scope.searchll = "";
        $scope.errors = [];
        $scope.closeAlert = function (i) {
            $scope.errors.splice(i, 1);
        };

        $scope.sellitem_listf = function (t) {
            return _.filter(sellitem_list, function (o) {
                return o.filter(t) && _.find($scope.sellitems_grp, function (s) {
                    return s.item.id == o.id;
                }) === undefined;
            });
        };

        $scope.filterItemsl = function(o) {
            return o.item.filter($scope.searchll);
        };
        $scope.addItem = function(item) {
            if (item.fuzzy_qty < 0) {
                $scope.errors.push("L'aliment " + item.name + " a un stock négatif, vous devez l'inventorier avant de pouvoir l'ajouter");
            } else {
                $scope.sellitems_grp.push({unit_factor: 1, item: item});
            }
            $scope.searchl = "";
        };
        $scope.removeItem = function(item) {
            var index = $scope.sellitems_grp.indexOf(item);
            $scope.sellitems_grp.splice(index, 1);
        };
        $scope.validate = function() {
            // Modification du premier SellItem
            $scope.sell_item_ref = $scope.sellitems_grp.shift().item;
            $scope.sell_item_ref.name = $scope.sell_item.name;
            $scope.sell_item_ref.unit_name = $scope.sell_item.unit_name;
            $scope.sell_item_ref.name_plural = $scope.sell_item.name_plural;
            $scope.sell_item_ref.unit_name_plural = $scope.sell_item.unit_name_plural;
            $scope.sell_item_ref.tax = $scope.sell_item.tax/100;
            var refId = $scope.sell_item_ref.id;
            var unit_factor = 1/$scope.sell_item_ref.unit_factor;
            var nb = $scope.sellitems_grp.length;
            $scope.sell_item_ref.$save().then(function(newSellItem) {
                while ($scope.sellitems_grp.length > 0) {
                    var itemToMerge = $scope.sellitems_grp.shift();
                    unit_factor = itemToMerge.unit_factor;
                    APIInterface.request({
                        'url': 'sellitem/' + refId + '/merge',
                        'method': 'PUT',
                        'data': {'sellitem': itemToMerge.item.id, 'unit_factor': unit_factor}
                    }).then(function () {
                        nb--;
                        if (nb == 0) {
                            $scope.sell_item_ref.$reload();
                            $scope.sell_item = SellItem.create();
                        }
                    });
                    itemToMerge.item.$remove();
                }
            });

        };
    }
])
.controller('admin.ctrl.food.appro',
    ['$scope', '$modal', 'api.models.buyitemprice', 'api.models.stockitem', 'admin.appro', '$timeout',
    function($scope, $modal, BuyItemPrice, StockItem, Appro, $timeout) {
        $scope.appro = Appro;
        $scope.buy_item_prices = BuyItemPrice.all();
        $scope.searchl = "";
        $scope.filterItemsl = function(o) {
            return o.buyitemprice.filter($scope.searchl);
        };
        $scope.filterItems = function(o) {
            return o.filter(Appro.itemToAdd);
        };
        $scope.buy_item_pricesf = function(v) {
            return _.filter($scope.buy_item_prices, function (bip) {
                return bip.filter(v);
            });
        };
        $scope.closeAlert = function(index) {
            Appro.errors.splice(index, 1);
        };

        $scope.newItem = function (e) {
            if (e.which === 13) {
                if (Appro.itemToAdd && !isNaN(Appro.itemToAdd)) {
                    var modalNewFood = $modal.open({
                        templateUrl: 'components/admin/food/modalAdd.html',
                        controller: 'admin.ctrl.food.addModal',
                        size: 'lg',
                        resolve: {
                            barcode: function () {
                                return Appro.itemToAdd;
                            },
                            buy_item: function () {
                                return undefined;
                            }
                        }
                    });
                    modalNewFood.result.then(function (buyItemPrice) {
                            Appro.addItem(buyItemPrice);
                            $timeout(function () {
                                document.getElementById("addApproItemInput").focus();
                            }, 300);
                        }, function () {

                    });
                }
            }
        };
        $(window).bind('beforeunload', function() {
            if (Appro.in()) {
                return "Attention, vous allez perdre l'appro en cours !"
            }
        });
        $timeout(function () {
            document.getElementById("addApproItemInput").focus();
        }, 300);
    }
])
.controller('admin.ctrl.food.autoappro.ooshop',
    ['$scope', '$http', '$modal', '$state', 'admin.appro',
    function($scope, $http, $modal, $state, Appro) {
        function parseOrder(bill) {
            var lines = bill.split('\n');
            for (var i = 0, n = lines.length ; i < n ; ++i) {
                var line = lines[i];
                // Les lignes qui correspondent à un aliment dans la facture sont de la forme (les champs séparés par des '\t') :
                // code_barre	nom_de_l’aliment	qté_commandée	qté_reçue	TVA_%	prix_unit.	prix_total
                var fields = line.split(/ *\t */);
                if (fields.length >= 4 && -1 != fields[0].search(/^[0-9]{13}$/)) {
                    if (!Appro.addItemFromBarcode(fields[0], parseFloat(fields[3]), parseFloat(fields[6].replace(",", ".")))) {
                        Appro.failedAutoAppro.push({
                            name: fields[1],
                            qty: parseFloat(fields[3]),
                            totalPrice: parseFloat(fields[6].replace(",", ".")),
                            barcode: fields[0]
                        });
                    }
                }
            }
            $state.go('bar.admin.food.appro', {bar: $scope.bar.id});
        }
        $scope.input = '';
        $scope.validate = parseOrder;
    }
])
.controller('admin.ctrl.food.autoappro.intermarche',
    ['$scope', '$http', '$modal', '$state', 'admin.appro',
    function($scope, $http, $modal, $state, Appro) {
        var INTERMARCHE_URL = AUTOAPPRO_URL + '/intermarche'; // Reverse proxy in the school
        var token;
        function connexion(login, password) {
            $scope.stape1.loading = true;
            $http.post(INTERMARCHE_URL + '/login', {email: login, mdp: password}).then(function(result) {
                console.log(result);
                if (!result.data.ecomToken) {
                    throw("Wrong Intermarché password");
                }
                token = result.data.ecomToken;
                return $http.get(INTERMARCHE_URL + '/orders?token=' + token);
            }).then(function(result2) {
                $scope.stape = 2;
                $scope.stape1.loading = false;
                $scope.stape2.orders = result2.data.Commandes;
            }).catch(function() {
                $scope.stape1.password = '';
                $scope.stape1.loading = false;
            });
        }

        function previewOrder(order) {
            var modalOrder = $modal.open({
                templateUrl: 'components/admin/food/autoappro/intermarche-modal-order.html',
                controller: ['$scope', 'items', function ($scope, items) {
                    $scope.items = items;
                }],
                size: 'lg',
                resolve: {
                    items: function () {
                        return order.ListeCommandeArticles;
                    }
                }
            });
        }
        function selectOrder(order) {
            order.loadings = true;
            var ids = _.map(order.ListeCommandeArticles, 'IdProduit');
            $http.post(INTERMARCHE_URL + '/details', ids).then(function(result) {
                var barcodes = {};
                _.forEach(result.data, function(item) {
                    barcodes[item.id] = item.gtin.replace(/^0+/, '');
                });
                _.forEach(order.ListeCommandeArticles, function(item) {
                    var barcode = barcodes[item.IdProduit];
                    if (!Appro.addItemFromBarcode(barcode, item.Quantite, item.PrixUnitaire*item.Quantite)) {
                        Appro.failedAutoAppro.push({
                            name: item.LibelleCourt,
                            qty: item.Quantite,
                            totalPrice: item.PrixUnitaire*item.Quantite,
                            barcode: barcode,
                            container: "",
                            link: "https://ws-mz-prd.mousquetaires.com/repo/produit/mcom/images/produits/" + item.NomImage
                        });
                    }
                });
                order.loadings = false;
                $state.go('bar.admin.food.appro', {bar: $scope.bar.id});
            });
        }
        $scope.stape = 1;
        $scope.stape1 = {
            login: '',
            password: '',
            validate: connexion,
            loading: false
        };
        $scope.stape2 = {
            orders: [],
            preview: previewOrder,
            select: selectOrder
        };
    }
])
.controller('admin.ctrl.food.autoappro.picard',
    ['$scope', '$http', '$modal', '$state', 'admin.appro',
    function($scope, $http, $modal, $state, Appro) {
        var PICARD_URL = AUTOAPPRO_URL + '/picard'; // Reverse proxy in the school
        var token;
        function connexion(login, password) {
            $scope.stape1.loading = true;
            $http.post(PICARD_URL + '/login', {username: login, password: password}).then(function(result) {
                if (result.data.error == "error") {
                    throw("Wrong Picard password");
                }
                token = result.data.session;
                return $http.get(PICARD_URL + '/orders', {headers: {'Authorization': token}});
            }).then(function(result2) {
                $scope.stape = 2;
                $scope.stape1.loading = false;
                $scope.stape2.orders = result2.data.data;
            }).catch(function() {
                $scope.stape1.password = '';
                $scope.stape1.loading = false;
            });
        }
        function getOrder(id) {
            return $http.get(PICARD_URL + '/orders/' + id, {headers: {'Authorization': token}});
        }
        function previewOrder(order) {
            order.loadingp = true;
            getOrder(order.order_no).then(function(result) {
                order.loadingp = false;
                var modalOrder = $modal.open({
                    templateUrl: 'components/admin/food/autoappro/picard-modal-order.html',
                    controller: ['$scope', 'items', function ($scope, items) {
                        $scope.items = items;
                    }],
                    size: 'lg',
                    resolve: {
                        items: function () {
                            return result.data.product_items;
                        }
                    }
                });
            });
        }
        function selectOrder(order) {
            order.loadings = true;
            getOrder(order.order_no).then(function(result) {
                _.forEach(result.data.product_items, function(item) {
                    var barcodes = item.details.ean.split(' ');
                    var success = false;
                    for (var i = 0; i < barcodes.length; i++) {
                        var barcode = barcodes[i];
                        if (Appro.addItemFromBarcode(barcode, item.c_facturationQuantite, item.c_facturationPrixTTC)) {
                            success = true;
                            break;
                        }
                    }
                    if (!success) {
                        Appro.failedAutoAppro.push({
                            name: item.item_text + " - " + item.details.manufacturer_name,
                            qty: item.c_facturationQuantite,
                            totalPrice: item.c_facturationPrixTTC,
                            barcode: item.details.ean,
                            container: $('<textarea />').html(item.details.c_conditionnement).text(),
                            link: "http://www.picard.fr/produits/prouit-" + item.product_id + ".html"
                        });
                    }
                });
                order.loadings = false;
                $state.go('bar.admin.food.appro', {bar: $scope.bar.id});
            });
        }
        $scope.stape = 1;
        $scope.stape1 = {
            login: '',
            password: '',
            validate: connexion,
            loading: false
        };
        $scope.stape2 = {
            orders: [],
            preview: previewOrder,
            select: selectOrder
        };
    }
])
.controller('admin.ctrl.food.autoappro.houra',
    ['$scope', '$http', '$modal', '$state', 'admin.appro',
    function($scope, $http, $modal, $state, Appro) {
        var HOURA_URL = AUTOAPPRO_URL + '/houra'; // Reverse proxy in the school
        var auth;
        function connexion(login, password, zipcode) {
            $scope.stape1.loading = true;
            auth = {
                login: login,
                password: sha1(password)
            };
            $http.post(HOURA_URL + '/login.php', {"postal-code": zipcode, authentication: auth}).then(function(result) {
                if (result.data.status.code != 0) {
                    throw("Wrong Houra password");
                }
                auth.userid = result.data.userId;
                return $http.post(HOURA_URL + '/lists.php', {authentication: auth});
            }).then(function(result2) {
                $scope.stape = 2;
                $scope.stape1.loading = false;
                $scope.stape2.glists = result2.data.list;
            }).catch(function() {
                $scope.stape1.password = '';
                $scope.stape1.loading = false;
            });
        }
        function getOrder(id) {
            return $http.post(HOURA_URL + '/list.php', {id: id,"cart-id": id,cartId: id, authentication: auth}).then(function(r) {
                _.forEach(r.data.products, function (p) {
                    p.price = parseFloat(p.uprice.replace('€', '').replace(',', '.'));
                    p.amount = parseFloat(p.amount);
                    p.total_price = p.price*p.amount;
                    if (p.images.length > 0) {
                        p.barcode = p.images[0].replace(/^.*([0-9]{13}).*$/, '$1');
                    }
                });
                return r;
            });
        }
        function previewOrder(order) {
            order.loadingp = true;
            getOrder(order.id).then(function(result) {
                console.log(result);
                order.loadingp = false;
                var modalOrder = $modal.open({
                    templateUrl: 'components/admin/food/autoappro/houra-modal-order.html',
                    controller: ['$scope', 'items', function ($scope, items) {
                        $scope.items = items;
                    }],
                    size: 'lg',
                    resolve: {
                        items: function () {
                            return result.data.products;
                        }
                    }
                });
            });
        }
        function selectOrder(order) {
            order.loadings = true;
            getOrder(order.id).then(function(result) {
                _.forEach(result.data.products, function(item) {
                    if (!Appro.addItemFromBarcode(item.barcode, item.amount, item.total_price)) {
                        Appro.failedAutoAppro.push({
                            name: item.name + " - " + item.brand,
                            qty: item.amount,
                            totalPrice: item.total_price,
                            barcode: item.barcode,
                            container: item.size,
                            link: "http://www.houra.fr/catalogue/?id_article=" + item.id
                        });
                    }
                });
                order.loadings = false;
                $state.go('bar.admin.food.appro', {bar: $scope.bar.id});
            });
        }
        $scope.stape = 1;
        $scope.stape1 = {
            login: '',
            password: '',
            zipcode: '91120',
            validate: connexion,
            loading: false
        };
        $scope.stape2 = {
            glists: [],
            preview: previewOrder,
            select: selectOrder
        };
    }
])
.controller('admin.ctrl.food.autoappro.chicandrun',
    ['$scope', '$http', '$modal', '$state', 'admin.appro',
    function($scope, $http, $modal, $state, Appro) {
        //api.chicandrun.fr futur url prévu, contact@chicandrun.fr si plus de données sont désirées
        var CHICANDRUN_URL = 'http://api.coeuracoeur.tk'; 
        var token;
        function connexion(login, password) {
            $scope.stape1.loading = true;
            $http.post(CHICANDRUN_URL , {email: login, password: password}).then(function(result) {
                console.log(result);
                if (!result.data.token) {
                    throw("Wrong Chic and run password");
                }
                token = result.data.token;
                return $http.post(CHICANDRUN_URL, {token: token});
            }).then(function(result2) {
                $scope.stape = 2;
                $scope.stape1.loading = false;
                $scope.stape2.orders = result2.data.orders;
            }).catch(function() {
                $scope.stape1.password = '';
                $scope.stape1.loading = false;
            });
        }
         function getOrder(id) {
             return $http.post(CHICANDRUN_URL, {token: token, order: id}).then(function(r) {
                    console.log(r.data);
                    _.forEach(r.data, function (p) {
                        p.price = parseFloat(p.unit_price_tax_incl.replace('€', '').replace(',', '.'));
                        p.amount = parseFloat(p.product_quantity);
                        p.total_price = p.price*p.amount;
                        p.barcode = p.ean13;
                    });
                return r;
            });
        }
        function previewOrder(order) {
            order.loadingp = true;
            getOrder(order.id).then(function(result) {
                order.loadingp = false;
                var modalOrder = $modal.open({
                    templateUrl: 'components/admin/food/autoappro/chicandrun-modal-order.html',
                    controller: ['$scope', 'items', function ($scope, items) {
                        $scope.items = items;
                    }],
                    size: 'lg',
                    resolve: {
                        items: function () {
                            return result.data;
                        }
                    }
                });
            });
        }
        
        function selectOrder(order) {
            order.loadings = true;
            getOrder(order.id).then(function(result) {
                _.forEach(result.data, function(item, key) {
                    var details = [];
                    if (!Appro.addItemFromBarcode(item.barcode, item.amount, item.total_price)) {
                        Appro.failedAutoAppro.push({
                            name: item.product_name,
                            qty: item.amount,                            
                            totalPrice: item.total_price,
                            barcode: item.barcode,
                            //futur url normalement prévu
                            link: "http://www.shop.chicandrun.fr/index.php?id_product="+item.product_id+"&id_product_attribute="+item.product_attribute_id+"&controller=product",
                            itemObj: item,
                            key: key
                        });
                        //Variable pour l'éventuel modal addproduct
                        details.name = item.product_name;
                        details.name_plural = item.product_name;
                        details.unit = item.product_unity;
                        details.unit_plural = item.product_unity;
                        details.container_qty = Number(item.product_value);
                        if(item.manufacturer){
                            details.brand = item.manufacturer;
                        }else if(item.supplier){
                            details.brand = item.supplier;
                        }
                        item['details']=details;
                        item.itemqty=1;
                        item.new_appro=true;
                    }
                });

            });
            order.loadings = false;
            $state.go('bar.admin.food.appro', {bar: $scope.bar.id}); 
        }
        $scope.stape = 1;
        $scope.stape1 = {
            login: '',
            password: '',
            validate: connexion,
            loading: false
        };
        $scope.stape2 = {
            orders: [],
            preview: previewOrder,
            select: selectOrder,
        };
    }
])
.controller('admin.ctrl.food.approhelper',
    ['$scope', 'bar', 'api.models.sellitem', '$q',
    function($scope, bar, SellItem, $q) {
        $scope.params = {
            date_appro_2next: new Date(),
            date_appro_next: new Date(),
            date_appro_before: new Date(),
        };
        $scope.items = [];
        $scope.searchl = '';
        $scope.search = function (item) {
            return item.sei.filter($scope.searchl);
        };

        function updateDataBuy(params) {
            var date_2next = moment(params.date_appro_2next);
            var date_next = moment(params.date_appro_next);
            var date_before = moment(params.date_appro_before);

            // On va regarder quelles sont les quantités consommées sur le même intervalle de temps
            // Par exemple si la personne indique prochaine appro "mardi 1er septembre"
            // et sur-prochaine appro "jeudi 10 septembre"
            // et tenir compte des achats avant le "mercredi 1er juillet"
            // alors on va regarder quelles ont été les quantités consommées
            // entre le "mardi 16 juin" et le "jeudi 25 juin"
            // Cela permet de prévoir les quantités qui seront consommées entre les deux appros

            // On va également regarder les quantités consommées les sept derniers jours
            // Afin de faire une moyenne par jour et d'estimer les quantités restantes
            // le jour de l'appro
            var date_end = date_before.clone().subtract(((date_before.day()-date_2next.day() + 7)%7), 'days');
            var date_start = date_end.clone().subtract(date_2next.diff(date_next, 'days'), 'days');
            var date_2end = date_start.clone().subtract(((date_start.day()-date_2next.day() + 7)%7), 'days');
            var date_2start = date_2end.clone().subtract(date_2next.diff(date_next, 'days'), 'days');
            var nbDays = date_next.diff(moment(), 'days');

            $q.all([
                bar.sellitem_ranking({date_start: date_start.toDate(), date_end: date_end.toDate()}),
                bar.sellitem_ranking({date_start: date_2start.toDate(), date_end: date_2end.toDate()}),
                bar.sellitem_ranking({date_start: moment().subtract(1, 'weeks').toDate()})
            ]).then(function (data) {
                var itemsObj = {};
                var items = [];

                // On estime les quantités restantes le jour de l'appro
                _.forEach(data[2], function (sei) {
                    var item = {id: sei.id, sei: SellItem.get(sei.id)};
                    item.qtyBefore = Math.max(0, item.sei.fuzzy_qty + sei.total/7*nbDays);
                    itemsObj[sei.id] = item;
                });

                // On a calculé les quantités consommées sur deux fois l'intervalle précisé
                // On va fusionner et moyenner ces deux listes
                var buyed = {};
                _.forEach(data[0], function (sei) {
                    buyed[sei.id] = {total: sei.total/2, val: sei.val};
                });

                _.forEach(data[1], function (sei) {
                    if (buyed[sei.id]) {
                        buyed[sei.id].total = buyed[sei.id].total + sei.total/2;
                        buyed[sei.id].val += sei.val;
                    } else {
                        buyed[sei.id] = {total: sei.total/2, val: sei.val};
                    }
                });

                // Ensuite on estime les quantités à acheter
                _.forEach(buyed, function (sei, id) {
                    var item;
                    if (itemsObj[id]) {
                        item = itemsObj[id];
                    } else {
                        // S'il n'y a pas eu de consommation jusqu'à aujourd'hui,
                        // on fait l'hypothèse qu'il n'y en aura pas jusqu'à la
                        // prochaine appro
                        item = {id: id, sei: SellItem.get(id), qtyBefore: Math.max(0, SellItem.get(id).fuzzy_qty)};
                    }

                    // On estime les quantités à acheter
                    item.qtyToBuy = Math.max(0, -sei.total - item.qtyBefore);
                     // Équivalent en nombre de transactions ; utile uniquement pour le tri
                    item.nbToBuy = item.qtyToBuy*sei.val/sei.total;
                    // Quantité qui devrait être consommée entre les deux appros
                    item.qtyBuyed = -sei.total;

                    itemsObj[id] = item;
                });

                _.forEach(itemsObj, function (item) {
                    items.push(item);
                });

                $scope.items = items;
            });
        }

        if (bar.settings.next_scheduled_appro) {
            var next_scheduled_appro = moment(bar.settings.next_scheduled_appro);
            if (moment().isBefore(next_scheduled_appro)) {
                $scope.params.date_appro_2next = next_scheduled_appro.clone().add(1, 'weeks').toDate();
                $scope.params.date_appro_next = next_scheduled_appro.toDate();
            } else {
                $scope.params.date_appro_2next = next_scheduled_appro.clone().add(2, 'weeks').toDate();
                $scope.params.date_appro_next = next_scheduled_appro.clone().add(1, 'weeks').toDate();
            }
        }

        updateDataBuy($scope.params);

        $scope.dateChange = updateDataBuy;

        // Utils functions for datepicker
        $scope.date_appro_2next_opened = false;
        $scope.date_appro_next_opened = false;
        $scope.date_appro_before_opened = false;
        $scope.open = function($event, w) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.date_appro_2next_opened = false;
            $scope.date_appro_next_opened = false;
            $scope.date_appro_before_opened = false;
            if (w == 'date_appro_next') {
                $scope.date_appro_next_opened = true;
            } else if (w == 'date_appro_2next') {
                $scope.date_appro_2next_opened = true;
            } else if (w == 'date_appro_before') {
                $scope.date_appro_before_opened = true;
            }
        };
    }
])
.controller('admin.ctrl.food.addModal',
    ['$scope', '$modalInstance', 'api.models.sellitem', 'api.models.itemdetails', 'api.models.buyitem', 'api.models.buyitemprice', 'api.models.stockitem', 'barcode', 'buy_item',
    function($scope, $modalInstance, SellItem, ItemDetails, BuyItem, BuyItemPrice, StockItem, barcode, buy_item) {
        $scope.barcode = barcode;
        $scope.buy_item = buy_item;
        $scope.origin = {
            callback: function(buy_item_price) {
                $modalInstance.close(buy_item_price);
            }
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
])
.controller('admin.ctrl.dir.barsadminfoodadd',
    ['$scope', '$modal', '$timeout', '$q', 'api.models.sellitem', 'api.models.itemdetails', 'api.models.stockitem', 'api.models.buyitem', 'api.models.buyitemprice', 'api.services.action', 'OFF', 'auth.user', 'bar.infos',
    function($scope, $modal, $timeout, $q, SellItem, ItemDetails, StockItem, BuyItem, BuyItemPrice, APIAction, OFF, user, BarInfos) {
        $scope.user = user;
        var init_items;
        var data;
        var oItemdetails;
        function init() {
            data = {
                barcode: '',
                is_pack: false,
                new_sell: true,
                bi_id: null,
                bip_id: null,
                id_id: null,
                sti_id: null,
                sei_id: null,
                bi_itemqty: null,
                bip_price: '',
                id_name: '',
                id_name_plural: '',
                id_brand: '',
                id_container: '',
                id_container_plural: '',
                id_container_qty: '',
                id_unit: '',
                id_unit_plural: '',
                sti_sell_to_buy: '',
                sei_name: '',
                sei_name_plural: '',
                sei_unit_name: '',
                sei_unit_name_plural: '',
                sei_tax: BarInfos.bar.settings.default_tax*100,
                old_sei_name: '',
                old_sei_name_plural: '',
                old_sei_unit_name: '',
                old_sei_unit_name_plural: '',
                old_sei_tax: 0,
                keywords: '',
                itemInPack: '',
                oldSellItem: ''
            };
            oItemdetails = ItemDetails.create();
            $scope.data = data;
            $scope.allow_barcode_edit = true;
            $timeout(function () {
                document.getElementById("fbarcode").focus();
            }, 300);
        }
        init();
        // Si un barcode est fourni au chargement, on s'en occupe
        data.barcode = $scope.barcode;
        if (data.barcode && data.barcode != "") {
            if($scope.buy_item.new_appro){
                $scope.allow_barcode_edit = $scope.buy_item.new_appro;
            }else{
                $scope.allow_barcode_edit = false;
            }
            search(data.barcode);
        }
        // Si un BuyItem est fourni au chargement, on s'en occupe
        if ($scope.buy_item) {           
            if($scope.buy_item.new_appro){
                $scope.allow_barcode_edit = $scope.buy_item.new_appro;
            }else{
                $scope.allow_barcode_edit = false;
            }
            data.barcode = $scope.buy_item.barcode;
            fillWithBuyItem($scope.buy_item);
        }
        $scope.alerts = [];
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        function resetf() {
            init();
        }
        $scope.overviewItemdetails = function () {
            oItemdetails.name = data.id_name;
            oItemdetails.name_plural = data.id_name_plural;
            oItemdetails.brand = data.id_brand;
            oItemdetails.container = data.id_container;
            oItemdetails.container_plural = data.id_container_plural;
            oItemdetails.container_qty = data.id_container_qty;
            oItemdetails.unit = data.id_unit;
            oItemdetails.unit_plural = data.id_unit_plural;
            return oItemdetails;
        };

        $scope.new_details = function () {
            return data.bi_details_id == undefined;
        };

        // Rempli data avec ce qui va bien en fonction de buy_item
        function fillWithBuyItem(buy_item) {
            data.bi_id = buy_item.id;
            data.bi_itemqty = buy_item.itemqty;
            data.id_id = buy_item.details.id;
            data.id_name = buy_item.details.name;
            data.id_name_plural = buy_item.details.name_plural;
            data.id_container = buy_item.details.container;
            data.id_container_plural = buy_item.details.container_plural;
            data.id_unit = buy_item.details.unit;
            data.id_unit_plural = buy_item.details.unit_plural;
            data.id_container_qty = buy_item.details.container_qty;
            data.id_brand = buy_item.details.brand;
            data.sei_name = data.id_name;
            data.sei_name_plural = data.id_name_plural;
            data.sei_unit_name = data.id_unit;
            data.sei_unit_name_plural = data.id_unit_plural;
            data.sti_sell_to_buy = data.id_container_qty;
            data.itemInPack = buy_item.details.name;
            // A-t-on besoin de créer le StockItem ?
            var stockItem = _.find(StockItem.all(), function (i) {
                return i.details.id == data.id_id;
            });

            if (buy_item.itemqty != 1) {
                data.is_pack = true;
            } else {
                data.is_pack = false;
            }

            if (data.is_pack && !stockItem) {
                // Il faut trouver le BuyItem lié à l'ItemDetails
                // avec itemqty == 1
                return BuyItem.request({details: data.id_id}).then(function (bids) {
                    var buy_item = _.find(bids, function (f) {
                        return f.itemqty == 1;
                    });
                    if (buy_item) {
                        var modalNewFood = $modal.open({
                            templateUrl: 'components/admin/food/modalAdd.html',
                            controller: 'admin.ctrl.food.addModal',
                            size: 'lg',
                            backdrop: 'static',
                            resolve: {
                                barcode: function () {
                                    return undefined;
                                },
                                buy_item: function () {
                                    return buy_item;
                                }
                            }
                        });
                        modalNewFood.result.then(function (buyItemPrice) {
                            $scope.choiceItemDetail(buyItemPrice);
                            data.itemInPack = buyItemPrice.buyitem.details.name;
                        }, function () {
                            console.log("Modal fermée ; c'est très mauvais");
                        });
                    }
                });
            } else if (stockItem) {
                data.sti_id = stockItem.id;
                data.sti_sell_to_buy = stockItem.sell_to_buy;
            }
        }

        // Cherche dans la bdd globale
        // Appelée par search() (basic = false) et par ng-change sur barcode (basic = true)
        function searchGlobal (barcode, basic) {
            if (!barcode) {
                return false;
            }
            // On regarde si le bar vend déjà ce code-barre
            var buy_item_price = _.find(BuyItemPrice.all(), function (f) {
                return f.buyitem.barcode == barcode;
            });
            // Le BuyItemPrice n'existe pas, l'aliment n'a jamais été acheté par le bar
            // On va voir si le BuyItem correspondant existe
            if (!buy_item_price && !basic) {
                return BuyItem.request({barcode: barcode}).then(function (bis) {
                    if (bis.length > 0) {
                        // Le BuyItem existe déjà (et l'ItemDetails associé)
                        var buy_item = bis[bis.length - 1];
                        fillWithBuyItem(buy_item);
                        return true;
                    }
                    return false;
                });
            } else if (buy_item_price) {
                // $scope.buy_item_price = buy_item_price;
                // $scope.buy_item = buy_item_price.buyitem;
                // $scope.item_details = buy_item_price.buyitem.details;
                //
                // var stock_item = _.find(StockItem.all(), function (si) {
                //     return si.details == buy_item_price.buyitem.details;
                // });
                // if (stock_item) {
                //     $scope.barcodeErrorSI = stock_item;
                //     $scope.block = true;
                //     $scope.stock_item = stock_item;
                //     $scope.sell_item = stock_item.sellitem;
                //     return false;
                // }
                $scope.barcodeErrorSI = true;
                $scope.block = true;
                return true;
            } else {
                if(!$scope.buy_item.new_appro){
                    data.bi_id = null;
                    data.bi_itemqty = '';
                    data.id_id = null;
                    data.id_name = '';
                    data.id_name_plural = '';
                    data.id_container = '';
                    data.id_container_plural = '';
                    data.id_unit = '';
                    data.id_unit_plural = '';
                    data.id_container_qty = '';
                    data.id_brand = '';
                    data.itemInPack = '';
                }
            }
            if (basic) {
                $scope.block = false;
                delete $scope.barcodeErrorSI;
            }
            return false;
        };

        // Recherche sur OpenFoodFacts
        function searchOff(barcode) {
            OFF.get(barcode).then(function (infos) {
                if (infos) {
                    if (infos.is_pack) {
                        data.is_pack = true;
                        data.bi_itemqty = parseInt(infos.itemqty);
                    }
                    data.id_name = infos.sell_name;
                    data.id_name_plural = infos.sell_name_plural;
                    data.id_brand = infos.brand;
                    data.id_unit = infos.unit_name;
                    data.id_unit_plural = infos.unit_name_plural;
                    data.id_container_qty = infos.sell_to_buy;
                    data.sei_name = infos.sell_name;
                    data.sei_name_plural = infos.sell_name_plural;
                    data.sei_unit_name = infos.unit_name;
                    data.sei_unit_name_plural = infos.unit_name_plural;
                    data.sti_sell_to_buy = infos.sell_to_buy;
                }
            });
        };

        function search(barcode) {
            if (!$scope.block) {
                var rs = searchGlobal(barcode);
                if (rs !== true && rs !== false) {
                    rs.then(function (result) {
                        if (!result) {
                            searchOff(barcode);
                        }
                    });
                }
            }
        }

        // Lancer une recherche en faisant Entrée
        $scope.searchf = function (e) {
            if (e.which === 13) {
                e.preventDefault();
                search(data.barcode);
            }
        };

        $scope.searchGlobal = searchGlobal;

        // Si on est en train d'ajouter un pack, on scanne un item, et il n'existe pas
        $scope.createItemPack = function (e) {
            if (e.which === 13) {
                e.preventDefault();
                if (!isNaN(data.itemInPack)) {
                    var modalNewFood = $modal.open({
                        templateUrl: 'components/admin/food/modalAdd.html',
                        controller: 'admin.ctrl.food.addModal',
                        size: 'lg',
                        resolve: {
                            barcode: function () {
                                return data.itemInPack;
                            },
                            buy_item: function () {
                                return undefined;
                            }
                        }
                    });
                    modalNewFood.result.then(function (buyItemPrice) {
                            $scope.choiceItemDetail(buyItemPrice);
                            data.itemInPack = buyItemPrice.buyitem.details.name;
                        }, function () {

                    });
                }
            }
        };

        // Typehead for BuyItemPrices choice
        $scope.buy_item_prices = BuyItemPrice.all();
        $scope.buy_item_pricesf = function (v) {
            return _.uniq(_.filter($scope.buy_item_prices, function (o) {
                return o.filter(v);
            }), false, function (bip) {
                return bip.buyitem.details;
            });
        };
        $scope.choiceItemDetail = function(item, model, label) {
            data.id_id = item.buyitem.details.id;
        };
        // Typehead for SellItem choice
        $scope.sellitems = SellItem.all();
        $scope.sellitemsf = function (v) {
            return _.filter($scope.sellitems, function (o) {
                return o.filter(v);
            });
        };
        $scope.choiceSellItem = function(item, model, label) {
            data.sei_id = item.id;
            data.old_sei_name = item.name;
            data.old_sei_name_plural = item.name_plural;
            data.old_sei_unit_name = item.unit_name;
            data.old_sei_unit_name_plural = item.unit_name_plural;
            data.old_sei_tax = item.tax;
            data.keywords = item.keywords;
        };

        $scope.addFood = function() {
            // Création
            var buy_item = BuyItem.create();
            var buy_item_price = BuyItemPrice.create();
            var item_details = ItemDetails.create();
            var stock_item = StockItem.create();
            var sell_item = SellItem.create();

            // Préparation
            buy_item_price.price = data.bip_price;
            stock_item.sell_to_buy = 1/data.sti_sell_to_buy;
            stock_item.price = data.bip_price;
            if (!data.bi_id) {
                buy_item.barcode = data.barcode;
                if (data.is_pack) {
                    buy_item.itemqty = data.bi_itemqty;
                } else {
                    buy_item.itemqty = 1;
                }
            } else {
                buy_item_price.buyitem = data.bi_id;
            }
            if (!data.id_id) {
                item_details.name = data.id_name;
                item_details.name_plural = data.id_name_plural;
                item_details.container = data.id_container;
                item_details.container_plural = data.id_container_plural;
                if (parseFloat(data.id_container_qty)) {
                    item_details.container_qty = parseFloat(data.id_container_qty);
                } else {
                    item_details.container_qty = 1;
                }
                item_details.unit = data.id_unit;
                item_details.unit_plural = data.id_unit_plural;
                item_details.brand = data.id_brand;
                item_details.keywords = data.keywords;
            } else {
                buy_item.details = data.id_id;
                stock_item.details = data.id_id;
            }
            if (data.new_sell) {
                sell_item.name = data.sei_name;
                sell_item.name_plural = data.sei_name_plural;
                sell_item.keywords = data.keywords;
                sell_item.unit_name = data.sei_unit_name;
                sell_item.unit_name_plural = data.sei_unit_name_plural;
                sell_item.tax = data.sei_tax*0.01;
            } else {
                stock_item.sellitem = data.sei_id;
            }
            console.log(data);
            console.log(buy_item);
            console.log(buy_item_price);
            console.log(item_details);
            console.log(stock_item);
            console.log(sell_item);

            // Enregistrement
            function errorSaving() {
                $scope.alerts.push({type: 'danger', msg: "Une erreur s'est produite lors de l'ajout de l'aliment. Veuillez le signaler au Binet Réseau. Celui-ci a probablement été créé à moitié et risque de faire bugguer le site."});
                console.log("Une erreur s'est produite lors de l'enregistrement d'une entité");
                init();
            }
            var nbEnd = 0;
            function entityEnd(nb) {
                if (!nb) {
                    nb = 1;
                }
                nbEnd += nb;
                if (nbEnd == 5) {
                    var promises = [];
                    if (buy_item_price.id > 0) {
                        promises.push(buy_item.$reload());
                    }
                    if (sell_item.id > 0) {
                        promises.push(sell_item.$reload());
                    }
                    if (stock_item.id > 0) {
                        promises.push(stock_item.$reload());
                        promises.push(item_details.$reload());
                        promises.push(sell_item.$reload());
                    }

                    $q.all(promises).then(function() {
                        $scope.alerts.push({type: 'success', msg: "L'aliment a été correctement créé."});
                        $scope.origin.callback(buy_item_price);
                        init();
                    });
                }
            }
            function saveBuyItemPrice() {
                buy_item_price.$save().then(function (bip) {
                    buy_item_price = bip;
                    entityEnd();
                }, errorSaving);
            }
            function saveBuyItem() {
                if (!data.bi_id) {
                    buy_item.$save().then(function (bi) {
                        buy_item = bi;
                        buy_item_price.buyitem = bi.id;
                        saveBuyItemPrice();
                        entityEnd();
                    }, errorSaving);
                } else {
                    entityEnd();
                    saveBuyItemPrice();
                }
            }
            function saveItemDetails() {
                if (!data.id_id) {
                    item_details.$save().then(function (id) {
                        item_details = id;
                        stock_item.details = id.id;
                        buy_item.details = id.id;
                        saveBuyItem();
                        saveSellItem();
                        entityEnd();
                    }, errorSaving);
                } else {
                    entityEnd();
                    saveBuyItem();
                    saveSellItem();
                }
            }
            function saveSellItem() {
                if (data.new_sell) {
                    sell_item.$save().then(function (sei) {
                        sell_item = sei;
                        stock_item.sellitem = sei.id;
                        saveStockItem();
                        entityEnd();
                    }, errorSaving);
                } else {
                    entityEnd();
                    saveStockItem();
                }
            }
            function saveStockItem() {
                stock_item.$save().then(function (sti) {
                    stock_item = sti;
                    entityEnd();
                }, errorSaving);
            }

            if (data.is_pack) {
                entityEnd(3);
                saveBuyItem();
            } else {
                saveItemDetails();
            }
        };

        $scope.isValid = function () {
            return !$scope.block && data.bip_price &&
                (
                    (data.is_pack // C'est un pack
                        && data.bi_itemqty && data.id_id) ||
                    (!data.is_pack // Ce n'est pas un pack
                        && (data.bi_id // Aliment acheté existant
                            || (data.id_name && data.id_name_plural)) // Nouvel aliment acheté
                        && ((data.new_sell // C'est un nouvel aliment vendu
                                && data.sei_name && data.sei_name_plural && (data.sei_tax === 0 || data.sei_tax > 0)
                                && data.sti_sell_to_buy
                            ) ||
                            (!data.new_sell
                                && data.sei_id && data.sti_sell_to_buy
                            )
                        )
                    )
                );
        };

        $scope.$watch('data.id_name', function (newv, oldv) {
            if (data.id_name_plural == oldv) {
                data.id_name_plural = newv;
            }
        });
        $scope.$watch('data.id_container', function (newv, oldv) {
            if (data.id_container_plural == oldv) {
                data.id_container_plural = newv;
            }
        });
        $scope.$watch('data.id_unit', function (newv, oldv) {
            if (data.id_unit_plural == oldv) {
                data.id_unit_plural = newv;
            }
        });
        $scope.$watch('data.sei_name', function (newv, oldv) {
            if (data.sei_name_plural == oldv) {
                data.sei_name_plural = newv;
            }
        });
        $scope.$watch('data.sei_unit_name', function (newv, oldv) {
            if (data.sei_unit_name_plural == oldv) {
                data.sei_unit_name_plural = newv;
            }
        });
    }
])
.directive('barsAdminFoodAdd', function() {
    return {
        restrict: 'E',
        scope: {
            barcode: '=?barcode',
            buy_item: '=?buyItem',
            origin: '=?origin'
        },
        templateUrl: 'components/admin/food/formFood.html',
        controller: 'admin.ctrl.dir.barsadminfoodadd'
    };
})
.controller('admin.ctrl.food.inventory',
    ['$scope', '$timeout', 'api.models.buyitemprice', 'api.models.buyitem', 'api.models.sellitem', 'admin.inventory',
    function($scope, $timeout, BuyItemPrice, BuyItem, SellItem, Inventory) {
        $scope.admin.active = 'food';

        $scope.moment = moment;

        var buy_item_prices = BuyItemPrice.all();
        $scope.buy_item_pricesf = function (v) {
            return _.filter(buy_item_prices, function (bip) {
                return bip.filter(v);
            });
        };

        $scope.timeLimit = 6;
        var firstDate;
        function monthsAgo(n) {
            var d = new Date();
            d.setMonth(d.getMonth() - n);
            return d;
        }
        $scope.timeChanged = function() {
            firstDate = monthsAgo($scope.timeLimit);
        };
        $scope.timeChanged();

        $scope.barcodei = '';
        $scope.searcha = '';
        // Filtre sur les aliments dans l'inventaire
        $scope.filterl = function (o) {
            return o.stockitem.filter($scope.searcha);
        };

        $scope.searchi = '';
        $scope.food_list = SellItem.all();
        // Filtre sur les SellItem
        $scope.filteri = function(o) {
            return !o.deleted
            && o.filter($scope.searchi, true)
            && new Date(o.oldest_inventory) >= firstDate
            && !o.inventoryComplete;
        };
        // Filtre sur les StockItem
        $scope.filters = function (o) {
            return !Inventory.find(o)
            && o.filter($scope.searchi, true)
            && new Date(o.last_inventory) >= firstDate;
        };
        // On scanne un code-barres
        $scope.addBarcode = function (e) {
			if (e.which === 13) {
				var barcode = $scope.barcodei;
				if (barcode && !isNaN(barcode)) {
					var buy_item = _.find(BuyItem.all(), function (bi) {
						return bi.filter(barcode);
					});
					if (buy_item) {
                        if (buy_item.details.stockitem && buy_item.details.stockitem.sellitem) {
                            Inventory.addStockItem(buy_item.details.stockitem, buy_item.itemqty);
                            $scope.barcodei = "";
                        }
					}
				}
			}
		};

        $timeout(function () {
            document.getElementById("addInventoryItemInput").focus();
        }, 300);

        $scope.inventory = Inventory;
    }
])
.controller('admin.ctrl.food.graphs',
    ['$scope',
    function($scope) {
        $scope.admin.active = 'food;'
    }
])
.controller('admin.ctrl.food.stockitems_list',
    ['$scope', 'stockitem_list',
    function($scope, stockitem_list){
        $scope.moment = moment;
        $scope.stockitem_list = stockitem_list;
        $scope.searchl = "";
        $scope.list_order = 'details.name';
        $scope.reverse = false;
        $scope.filterItems = function(o) {
            return o.filter($scope.searchl);
        }
        $scope.filterHidden = function() {
            if ($scope.showHidden) {
                return '';
            } else {
                return {
                    deleted: false
                };
            }
        };
    }
])
.factory('admin.appro',
    ['api.models.stockitem', 'api.models.buyitemprice', 'api.services.action', '$modal',
    function (StockItem, BuyItemPrice, APIAction, $modal) {
        var nb = 0;
        return {
            itemsList: [],
            totalPrice: 0,
            inRequest: false,
            itemToAdd: "",
            errors: [],
            /**
             * Contient les items dont l'auto-appro a échouée
             * {
             *     name: <string>,
             *     qty: <float>,
             *     totalPrice: <float>,
             *     barcode: <string>,
             *     container: <string>,
             *     link: <string>
             * }
             */
            failedAutoAppro: [],
            init: function() {
                this.itemsList = [];
                this.totalPrice = 0;
                this.inRequest = false;
            },
            newProd: function (item){
                var modalNewFood = $modal.open({
                    templateUrl: 'components/admin/food/modalAdd.html',
                    size: 'lg',
                    controller: 'admin.ctrl.food.addModal',
                    resolve: {
                        barcode: function () {
                            return item.itemObj.barcode;
                        },
                        buy_item: function () {
                            return item.itemObj;
                        },
                    }
                });

                var vm=this;
                modalNewFood.result.then(function (buyItemPrice) {
                    //console.dir(buyItemPrice);
                    if (vm.addItemFromBarcode(buyItemPrice.buyitem.barcode, item.itemObj.amount, item.itemObj.total_price)) {
                        var newFailedAutoAppro = [];
                        _.forEach(vm.failedAutoAppro, function(itemFail) {
                            if(itemFail.itemObj != item.itemObj){
                                newFailedAutoAppro.push(itemFail);
                            }
                        });
                        vm.failedAutoAppro = newFailedAutoAppro;
                        console.dir(vm.failedAutoAppro);
                    }
                }, function () {
                });
            },
            recomputeAmount: function() {
                var totalPrice = 0;
                _.forEach(this.itemsList, function(item, i) {
                    if (item.qty && item.qty > 0 && item.price) {
                        item.price = item.price * item.qty/(item.old_qty);
                        item.old_qty = item.qty;
                    }
                    totalPrice += item.price;
                });

                this.totalPrice = totalPrice;
            },
            addItem: function(buyitemprice, qty, price) {
                this.error = "";
                if (!qty) {
                    qty = 1;
                }
                var other = _.find(this.itemsList, {'buyitemprice': buyitemprice});
                if (other) {
                    other.qty += qty;
                    other.nb = nb++;
                } else {
                    // Avant de l'ajouter on va vérifier que l'itemdetails
                    // et surtout le stockitem existent bien
                    var ok = false;
                    if (buyitemprice.buyitem) {
                        if (buyitemprice.buyitem.details) {
                            var details = buyitemprice.buyitem.details;
                            var stockitem = _.find(StockItem.all(), {'details': details});
                            if (stockitem) {
                                if (stockitem.sellitem) {
                                    ok = true;
                                    if (!stockitem.sellitem.deleted) {//si l'aliment est caché, renvoyer un message spécifique et ne pas l'ajouter à l'appro
                                    //à voir : proposer de le "décacher" ??
                                        if (!price) {
                                            price = buyitemprice.price * qty;
                                        }
                                        this.itemsList.push({
                                            buyitemprice: buyitemprice,
                                            qty: qty,
                                            old_qty: qty,
                                            price: price,
                                            permanent: true,
                                            nb: nb++});
                                    }
                                    else {
                                        this.errors.push("L'aliment «"+stockitem.sellitem.name+"» a été caché : vous ne pouvez pas l'ajouter à l'appro.");
                                    }
                                }
                            }
                        }
                    }
                    if (!ok) {
                        this.errors.push("L'aliment de code-barre "+buyitemprice.buyitem.barcode+" n'a pas été correctement créé dans votre bar et ne peut pas être ajouté à l'appro.");
                    }
                }
                this.recomputeAmount();
                this.itemToAdd = "";
            },
            /**
             * Add the BuyItemPrice corresponding to the barcode to the appro
             * if it exists in the bar
             */
            addItemFromBarcode: function(barcode, qty, price) {
                var buyItemPrice = _.find(BuyItemPrice.all(), function (bip) {
                    return bip.buyitem.barcode == barcode;
                });
                if (buyItemPrice) {
                    this.addItem(buyItemPrice, qty, price);
                    return true;
                } else {
                    console.log("Aliment introuvable : " + barcode);
                    return false;
                }
            },
            removeItem: function(item) {
                this.itemsList.splice(this.itemsList.indexOf(item), 1);
                this.recomputeAmount();
            },
            validate: function() {
                this.inRequest = true;
                _.forEach(this.itemsList, function(item, i) {
                    item.qty = item.qty;
                    item.buy_price = item.price / (item.qty);
                    item.buyitem = item.buyitemprice.buyitem;
                    item.occasional = !item.permanent;
                });
                var refThis = this;
                APIAction.appro({
                    items: this.itemsList
                })
                .then(function() {
                    _.forEach(refThis.itemsList, function(item) {
                        if (item.permanent) {
                            item.buyitemprice.$reload();
                        }
                    });

                    refThis.init();
                }, function () {
                    console.log("Erreur lors de l'appro :///");
                    refThis.errors.push("Une erreur s'est produite lors de l'appro, celle-ci n'a pas été validée.");
                });
            },
            in: function() {
                return this.itemsList.length > 0;
            }
        };
    }]
)
.factory('admin.inventory',
    ['storage.bar', 'api.models.stockitem', 'api.services.action',
    function (storage, StockItem, APIAction) {
        var nb = 0;
        var inventory = {
            itemsList: [],
            inRequest: false,
            totalPrice: 0,
            validationError: false,
            init: function() {
                _.forEach(this.itemsList, function (item) {
                    delete item.stockitem.inventoryAdded;
                    delete item.stockitem.sellitem.inventoryComplete;
                });
                this.itemsList = [];
                this.inRequest = false;
                this.totalPrice = 0;
                this.validationError = false;
            },
            addSellItem: function(sellitem, qty) {
                if (!qty) {
                    qty = 0;
                }
                var _this = this;
                _.forEach(sellitem.stockitems, function(si) {
                    _this.addStockItem(si, qty);
                    si.inventoryAdded = true;
                });
                sellitem.inventoryComplete = true;
            },
            addStockItem: function(stockitem, qty) {
                var other = this.find(stockitem);
                if (other) {
                    other.qty += qty / other.sell_to_buy;
                    other.nb = nb++;
                } else {
                    // Avant de l'ajouter on va vérifier que l'itemdetails
                    // et surtout le stockitem existent bien
                    this.itemsList.push({ stockitem: stockitem, qty: qty, sell_to_buy: 1, nb: nb++, qty_diff: 0 });
                }

                this.updateStockItemAfterAdding(stockitem);
                this.recomputeAmount();
            },
            updateStockItemAfterAdding: function (stockitem) {
                // For list filtering
                stockitem.inventoryAdded = true;
                if (_.filter(stockitem.sellitem.stockitems, {inventoryAdded: true}).length === stockitem.sellitem.stockitems.length) {
                    stockitem.sellitem.inventoryComplete = true;
                }
            },
            find: function(stockitem) {
                return _.find(this.itemsList, {'stockitem': stockitem});
            },
            removeItem: function(item) {
                this.itemsList.splice(this.itemsList.indexOf(item), 1);
                item.stockitem.inventoryAdded = false;
                item.stockitem.sellitem.inventoryComplete = false;

                this.recomputeAmount();
            },
            recomputeAmount: function() {
                var totalPrice = 0;
                _.forEach(this.itemsList, function(item, i) {
                    if (item.qty === 0 || item.qty > 0) {
                        item.qty_diff = item.qty * item.sell_to_buy / item.stockitem.sell_to_buy - item.stockitem.qty;
                    }
                    totalPrice += item.qty_diff * item.stockitem.price;
                });

                this.totalPrice = totalPrice;

                this.save();
            },
            validate: function() {
                this.inRequest = true;
                this.validationError = false;
                var itemsToSend = [];
                _.forEach(this.itemsList, function(item, i) {
                    itemsToSend.push({qty: item.qty / item.stockitem.sell_to_buy * item.sell_to_buy, stockitem: item.stockitem});
                });
                var refThis = this;
                APIAction.inventory({
                    items: itemsToSend
                })
                .then(function() {
                    refThis.init();
                    storage.delete('inventory');
                })
                .catch(function() {
                    refThis.inRequest = false;
                    refThis.validationError = true;
                });
            },
            in: function() {
                return this.itemsList.length > 0;
            },
            restore: function() {
                var sinfos = storage.get('inventory');
                if (sinfos) {
                    // Si la sauvegarde date d'il y a plus de 7 jours, on supprime
                    if (moment(sinfos.date).isBefore(moment().subtract(1, 'weeks'))) {
                        storage.delete('inventory');
                        return;
                    }

                    _.forEach(sinfos.items, function (item) {
                        var stockitem = StockItem.get(item.stockitem);
                        this.itemsList.push({ stockitem: stockitem, qty: item.qty, sell_to_buy: item.sell_to_buy, nb: item.nb });
                        this.updateStockItemAfterAdding(stockitem);
                    }, this);

                    this.recomputeAmount();
                }
            },
            save: function() {
                storage.get('inventory').items = [];
                storage.get('inventory').date = new Date();

                _.forEach(this.itemsList, function (item) {
                    storage.get('inventory').items.push({stockitem: item.stockitem.id, qty: item.qty, sell_to_buy: item.sell_to_buy, nb: item.nb});
                });
            }
        };

        inventory.restore();

        return inventory;
    }]
)
;
