'use strict';

angular.module('bars.magicbar', [
	'bars.filters'
])

.controller('magicbar.ctrl',
    ['$scope', '$filter', 'api.models.food', 'api.services.action', 'magicbar.analyse',
    function($scope, $filter, Food, APIAction, analyse) {
        $scope.query = {
            type: 'buy',
            qty: 1,
            unit: null,
            name: '',
            hideAnalysis: false,
            hasError: false,
            errorMessage: ''
        };

        $scope.$watch('bar.search', function(qo) {
            analyse(qo, $scope);
        });

        $scope.executeQuery = function() {
            if ($scope.query.food === null && $scope.query.account === null) {
                return;
            }
            var type = $scope.query.type;

            if(_.contains(['buy', 'throw', 'give', 'punish', 'appro'], type)) {
                if (!$scope.query.hasError) {
                    var req;
                    if(_.contains(['buy', 'throw', 'appro'], type)) {
                        req = {item: $scope.query.food.id, qty: $scope.query.qty};
                    } else {
                        req = {account: $scope.query.account.id, amount: $scope.query.qty};
                    }
                    APIAction[type](req).then(function() {
                        $scope.bar.search = '';
                    });
                }
            }
        };
    }])

.factory('magicbar.analyse', ['$filter', function($filter) {
    var analyse = function(qo, $scope) {
        $scope.query = {
            type: '',
            qty: 1,
            unit: '',
            name: '',
            food: null,
            account: null,
            hasError: false,
            errorMessage: ''
        };
        var query = $scope.query;

        if(qo === "") {
            return query;
        }
        // On découpe la requête en termes
        var terms = qo.split(' ');

        var types = [
            'buy',
            'throw',
            'give',
            'punish',
            'appro',
        ];

        var units = [
            'g',
            'cg',
            'kg',
            'l',
            'ml',
            'cl',
        ];

        var aQty = [];
        var aFoods = [];
        var aUnits = [];
        var aAccounts = [];

        function cleana() {
            var i;
            for (i = (aQty.length - 1); i >= 0; i--) {
                if (aQty[i].used) {
                    aQty.splice(i, 1);
                }
            }
            for (i = (aFoods.length - 1); i >= 0; i--) {
                if (aFoods[i].used) {
                    aFoods.splice(i, 1);
                }
            }
            for (i = (aUnits.length - 1); i >= 0; i--) {
                if (aUnits[i].used) {
                    aUnits.splice(i, 1);
                }
            }
            for (i = (aAccounts.length - 1); i >= 0; i--) {
                if (aAccounts[i].used) {
                    aAccounts.splice(i, 1);
                }
            }
        }

        for (var i = 0; i < terms.length; i++) {
            // Type
            if (types.indexOf(terms[i]) > -1) {
                query.type = terms[i];
                continue;
            }

            var item = {
                isQty: false,
                isFood: false,
                isUnit: false,
                used: false
            };

            // Quantité
            if (/^([0-9]+(((\.)|€|,|(euro(s?)))[0-9]+)?).*$/.test(terms[i])) {
                item.qty = terms[i].replace(/^([0-9]+(((\.)|€|,|(euro(s?)))[0-9]+)?).*$/g, '$1').replace('/,/', '.').replace(/€/, '.').replace(/euros?/, '.');
                item.isQty = true;
            }

            // Unité
            if (units.indexOf(terms[i]) > -1) {
                item.isUnit = true;
                item.unit = terms[i];
                aUnits.push(item);
            } else {
                var unit = terms[i].replace(/^([0-9]+(((\.)|€|,|(euro(s?)))[0-9]+)?)(.*)$/g, '$7');
                if (unit != terms[i] && units.indexOf(unit) > -1) {
                    var itemu = {
                        isQty: false,
                        isFood: false,
                        isUnit: false,
                        used: false
                    };
                    itemu.isUnit = true;
                    itemu.unit = unit;
                    aUnits.push(itemu);
                }
            }

            // Food
            var foods = $filter('filter')($scope.bar.foods, function (o) {
                return (!o.deleted && (o.name.toLocaleLowerCase().indexOf(terms[i].toLocaleLowerCase()) > -1 ||
                    o.keywords.toLocaleLowerCase().indexOf(terms[i].toLocaleLowerCase()) > -1));
            }, false);
            if (foods.length === 0) {
                foods = $filter('filter')($scope.bar.foods, function (o) {
                    return (!o.deleted && (o.name.toLocaleLowerCase().indexOf(terms[i].toLocaleLowerCase().replace(/s$/, '')) > -1 ||
                        o.keywords.toLocaleLowerCase().indexOf(terms[i].toLocaleLowerCase().replace(/s$/, '')) > -1));
                }, false);
            }
            if (foods.length == 1) {
                item.isFood = true;
                item.food = foods[0];
            }

            // Push food et quantité
            if (item.isQty) {
                aQty.push(item);
            }
            if (item.isFood) {
                aFoods.push(item);
            }

            // Account
            var accounts = $filter('filter')($scope.bar.accounts, function (o) {
                return (o.owner.name.toLocaleLowerCase().indexOf(terms[i].toLocaleLowerCase()) > -1);
            }, false);
            if (accounts.length == 1) {
                aAccounts.push(accounts[0]);
            }
        }

        function analyseTerms() {
            // Réflexion et exécution
            if (aFoods.length == 1) {
                aFoods[0].used = true;
                query.food = aFoods[0].food;
                if (query.type === '') {
                    query.type = 'buy';
                }
                cleana();
            }
            if (aAccounts.length == 1) {
                query.account = aAccounts[0];
                aAccounts[0].used = true;
                if (query.type === '') {
                    query.type = 'give';
                }
                cleana();
            }
            if (aQty.length == 1) {
                query.qty = aQty[0].qty;
                aQty[0].used = true;
                cleana();
                if (aUnits.length == 1 && query.food !== null) {
                    query.unit = aUnits[0].unit;
                    aUnits[0].used = true;
                    cleana();
                    if ((/^k/i.test(query.food.unit) && !/^k/i.test(query.unit)) || (!/^m/i.test(query.food.unit) && /^m/i.test(query.unit))) {
                        query.qty *= 0.001;
                    } else if ((!/^k/i.test(query.food.unit) && /^k/i.test(query.unit)) || (/^m/i.test(query.food.unit) && !/^m/i.test(query.unit))) {
                        query.qty *= 1000;
                    } else if (/^c/i.test(query.food.unit) && !/^c/i.test(query.unit)) {
                        query.qty *= 100;
                    } else if (!/^c/i.test(query.food.unit) && /^c/i.test(query.unit)) {
                        query.qty *= 0.01;
                    }
                }
            }
            if (query.food !== null) {
                query.unit = query.food.unit;
            }
        }

        // 3 analyses car une analyse peut permettre de supprimer un des aliments qui serait la seule quantité et passer ainsi à un seul aliment
        analyseTerms();
        analyseTerms();
        analyseTerms();

        // Erreurs
        if (query.type == 'buy' || query.type == 'throw' || query.type == 'appro') {
            if (query.food === null) {
                query.hasError = true;
                query.errorMessage = "Cet aliment n'existe pas dans ce bar.";
            }
        }
        if (query.type == 'give' || query.type == 'punish') {
            if (query.account === null) {
                query.hasError = true;
                query.errorMessage = "Aucun utilisateur à ce nom dans ce bar.";
            }
        }
        if (query.type == 'give') {
            if (query.account !== null && $scope.user.account.id == query.account.id) {
                query.hideAnalysis = true;
                query.hasError = true;
                query.errorMessage = "Réfléchis mon grand ! On ne peut pas se faire de don à soi-même !";
            }
            if (query.qty <= 0) {
                query.hideAnalysis = true;
                query.hasError = true;
                query.errorMessage = "On ne peut donner que des montants strictement positifs.";
            }
        }

        return query;
    };
    return analyse;
}]);
