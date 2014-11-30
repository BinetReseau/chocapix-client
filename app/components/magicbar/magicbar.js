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
            errorMessage: '',
            suggest: []
        };

        $scope.$watch('bar.search', function(qo) {
            analyse(qo, $scope);
        });

        $scope.executeQuery = function($item, $model, $label) {
			console.log($model);
            if ($model.food === null && $model.account === null) {
                return;
            }
            var type = $model.type;

            if(_.contains(['buy', 'throw', 'give', 'punish', 'appro'], type)) {
                    var req;
                    if(_.contains(['buy', 'throw', 'appro'], type)) {
                        req = {item: $model.food.id, qty: $model.qty};
                    } else {
                        req = {account: $model.account.id, amount: $model.qty};
                    }
                    APIAction[type](req).then(function() {
                        $scope.bar.search = '';
                    });
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
            hasError: false,
            errorMessage: '',
            suggest: []
        };
        var query = $scope.query;

        if(typeof qo !== 'string' && !(qo instanceof String) || qo === "") {
            return query;
        }
        // Preprocessing
		qo = qo.toLocaleLowerCase();
		qo = qo.replace(/ ?(,|€|euro(s?)) ?/, '.');
        var terms = qo.split(' ');

        var types = [
            'buy',
            'throw',
            'give',
            'punish',
            'appro',
        ];
        var humanTypes = {
            'acheter': 'buy',
            'jeter': 'throw',
            'donner': 'give',
            'amende': 'punish',
            'appro': 'appro'
        };

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
			aQty = _.reject(aQty, 'used');
			aFoods = _.reject(aFoods, 'used');
			aUnits = _.reject(aUnits, 'used');
			aAccounts = _.reject(aAccounts, 'used');
        }

		var parsedTerms = [];
        for (var i = 0; i < terms.length; i++) {
			var term = terms[i];
			parsedTerms[i] = [];

            var item = {
                isQty: false,
                isFood: false,
                isUnit: false,
                isAccount: false,
                used: false
            };

            // Type
            if (humanTypes[term]) {
                query.type = humanTypes[term];
				parsedTerms[i].push({
					type: 'type',
					value: humanTypes[term]
				});
                continue;
            }

            // Quantity
			var match = /^([0-9]+(\.[0-9]+)?)(.*)$/g.exec(term);
            if (match) {
                var qty = match[1];
				var unit = match[3];
                item.isQty = true;
				item.qty = qty;

				var canBe ={
					type: 'qty',
					value: qty
				};
				if(unit !== '') {
					item.isUnit = true;
					item.unit = unit;
					canBe.unit = unit;
				}
				parsedTerms[i].push(canBe);
            }

            // Unit
            if (units.indexOf(term) > -1) {
                item.isUnit = true;
                item.unit = term;
				parsedTerms[i].push({
					type: 'unit',
					value: term
				});
            }

            // Food
            var foods = _.filter($scope.bar.foods, function (o) {
				return o.filter(term);
            });
            if (foods.length === 0) {
                foods = _.filter($scope.bar.foods, function (o) {
					return o.filter(term.replace(/s$/, ''));
                });
            }
            if (foods.length >= 1) {
                item.isFood = true;
                item.foods = foods;
				_.forEach(foods, function(f) {
					parsedTerms[i].push({
						type: 'food',
						value: f
					});
				});
            }

            // Account
            var accounts = _.filter($scope.bar.accounts, function (o) {
				return o.filter(term);
            });
            if (accounts.length >= 1) {
                item.isAccount = true;
                item.accounts = accounts;
				_.forEach(accounts, function(a) {
					parsedTerms[i].push({
						type: 'account',
						value: a
					});
				});
            }

            // Push
            if (item.isQty) {
                aQty.push(item);
            }
			if (item.isUnit) {
				aUnits.push(item);
			}
            if (item.isFood) {
                aFoods.push(item);
            }
            if (item.isAccount) {
                aAccounts.push(item);
            }
        }

		var suggestions = [];
		function hasType(suggestion, t) {
			return !!_.find(suggestion, {type:t});
		}
		function listSuggestions(i, suggestion) {
			suggestion = suggestion || [];
			i = i || 0;
			if(i >= parsedTerms.length) {
				if(hasType(suggestion, 'food') || hasType(suggestion, 'account')) {
					return [suggestion];
				} else {
					return [];
				}
			}
			var suggestions = [];
			for(var j = 0; j < parsedTerms[i].length; j++) {
				var canBe = parsedTerms[i][j];
				if((canBe.type === 'qty' || canBe.type === 'unit' || canBe.type === 'type') && hasType(suggestion, canBe.type)) {
					continue;
				} else if(canBe.type === 'qty' && canBe.unit && hasType(suggestion, 'unit')) {
					continue;
				} else if(canBe.type === 'account' && hasType(suggestion, 'food')) {
					continue;
				} else if(canBe.type === 'food' && hasType(suggestion, 'account')) {
					continue;
				} else if(canBe.type === 'account' || canBe.type === 'food') {
					var other = hasType(suggestion, canBe.type);
					if(other && other.value !== canBe.value) {
						continue;
					} else if (other) { // Do not add food again
						suggestions.push(listSuggestions(i+1, suggestion));
						continue;
					}
				}
				var nsuggestion = _.clone(suggestion);
				nsuggestion.push(canBe);
				suggestions.push(listSuggestions(i+1, nsuggestion));
			}
			return _.flatten(suggestions, true);
		}
		console.log(listSuggestions());

		query.suggest = _.flatten(_.map(listSuggestions(),
			function(suggestion) {
				var res = {};
				_.forEach(suggestion, function(v) {
					res[v.type] = v.value;
					if(v.type === 'qty' && v.unit) {
						res.unit = v.unit;
					}
				});
				if(_.find(suggestion, {type:'account'})) {
					res.otype = 'account';
					res.type = res.type || 'give';
					if(res.type !== 'give' && res.type !== 'punish') {
						return []; // Discard
					}
				} else {
					res.otype = 'food';
					res.type = res.type || 'buy';
					if(res.type !== 'buy' && res.type !== 'throw' && res.type !== 'appro') {
						return []; // Discard
					}
				}
				res.qty = res.qty || 1;
				return [res];
		}), true);


        // var qFoods = [];
        // var qAccounts = [];
		//
        // function analyseTerms() {
        //     // Réflexion et exécution
        //     if (aFoods.length === 1) { // un seul terme donnait des aliments
        //         aFoods[0].used = true;
        //         qFoods = aFoods[0].foods;
        //     }
        //     if (aAccounts.length === 1) { // un seul terme donnait des accounts
        //         qAccounts = aAccounts[0].accounts;
        //         aAccounts[0].used = true;
        //     }
		// 	cleana();
        //     if (aQty.length === 1) { // un seul terme donnait des quantités
        //         query.qty = aQty[0].qty;
        //         aQty[0].used = true;
        //         cleana();
        //     }
        //     if (aUnits.length === 1) { // un seul terme donnait une unité
        //         query.unit = aUnits[0].unit;
        //         aUnits[0].used = true;
        //         cleana();
        //     }
        // }
		//
        // // 3 analyses car une analyse peut permettre de supprimer un des aliments qui serait la seule quantité et passer ainsi à un seul aliment
        // analyseTerms();
        // analyseTerms();
        // analyseTerms();
		//
        // // On intersecte les différentes listes
        // if (qFoods.length === 0 && aFoods.length > 0) {
		// 	qFoods = aFoods[0].foods;
		//
        //     for (i = 1; i < aFoods.length; i++) {
		// 		qFoods = qFoods.filter(function(o) {
		// 				return aFoods[i].foods.indexOf(o) !== -1;
		// 		});
        //     }
        // }
		// if (qAccounts.length === 0 && aAccounts.length > 0) {
		// 	qAccounts = aAccounts[0].accounts;
		//
		// 	for (i = 1; i < aAccounts.length; i++) {
		// 		qAccounts = qAccounts.filter(function(o) {
		// 			return aAccounts[i].accounts.indexOf(o) !== -1;
		// 		});
		// 	}
		// }
		//
		// // Puis on ajoute le tout aux suggestions
		// var fType = query.type;
		// if (fType === '') {
		// 	fType = 'buy';
		// }
		// if (fType !== 'punish' && fType !== 'give') {
	    //     for (i = 0; i < qFoods.length; i++) {
	    //         var os = {
	    //             otype: 'food',
	    //             food: qFoods[i],
	    //             qty: query.qty,
	    //             unit: query.unit,
	    //             type: fType
	    //         };
	    //         if (os.unit !== "") {
	    //             if ((/^k/i.test(os.food.unit) && !/^k/i.test(os.unit)) || (!/^m/i.test(os.food.unit) && /^m/i.test(os.unit))) {
	    //                 os.qty *= 0.001;
	    //             } else if ((!/^k/i.test(os.food.unit) && /^k/i.test(os.unit)) || (/^m/i.test(os.food.unit) && !/^m/i.test(os.unit))) {
	    //                 os.qty *= 1000;
	    //             } else if (/^c/i.test(os.food.unit) && !/^c/i.test(os.unit)) {
	    //                 os.qty *= 100;
	    //             } else if (!/^c/i.test(os.food.unit) && /^c/i.test(os.unit)) {
	    //                 os.qty *= 0.01;
	    //             }
	    //         }
	    //         query.suggest.push(os);
	    //     }
		// }
		//
		// var aType = query.type;
		// if (aType === '') {
		// 	aType = 'give';
		// }
		// if (aType === 'give' || aType === 'punish') {
	    //     for (i = 0; i < qAccounts.length; i++) {
	    //         query.suggest.push({
		// 			otype: 'account',
		// 			account: qAccounts[i],
		// 			qty: query.qty,
		// 			type: aType
		// 		});
	    //     }
		// }

        /*
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
        */

        return query;
    };
    return analyse;
}]);
