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
		qo = qo.replace(/,/, '.');
		qo = qo.replace(/ ?(€|euro(s?))/, '€');
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
            '€',
        ];


		var parsedTerms = [];
        for (var i = 0; i < terms.length; i++) {
			var term = terms[i];
			parsedTerms[i] = [];

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
			var match = /^([0-9]+(\.[0-9]+)?)(\D*)$/g.exec(term);
            if (match) {
                var qty = match[1];
				var unit = match[3];

				var canBe ={
					type: 'qty',
					value: qty
				};
				if(unit !== '') {
					canBe.unit = unit;
				}
				parsedTerms[i].push(canBe);
            }

            // Unit
            if (units.indexOf(term) > -1) {
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
				_.forEach(accounts, function(a) {
					parsedTerms[i].push({
						type: 'account',
						value: a
					});
				});
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
					var other = _.find(suggestion, {type:canBe.type});
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
					if((res.type !== 'buy' && res.type !== 'throw' && res.type !== 'appro')
							|| res.unit === "€"){
						return []; // Discard
					}
				}
				res.qty = res.qty || 1;
				return [res];
		}), true);


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
