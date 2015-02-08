'use strict';

angular.module('bars.magicbar', [
	'bars.filters'
])

.controller('magicbar.ctrl',
    ['$scope', '$filter', 'api.models.food', 'api.services.action', 'magicbar.analyse', 'bars.meal',
    function($scope, $filter, Food, APIAction, analyse, Meal) {
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
            if ($item.food === null && $item.account === null) {
                return;
            }
            var type = $item.type;

            if(_.contains(['buy', 'throw', 'give', 'punish', 'appro', 'inventory', 'deposit'], type)) {
                var req;
                if(_.contains(['buy', 'throw'], type)) {
                    req = {item: $item.food.id, qty: $item.qty*$item.food.unit_value};
                } else if(_.contains(['inventory', 'appro'], type)) {
					req = {items:
						[{
							item: $item.food.id,
							qty: $item.qty*$item.food.unit_value
						}]
					};
				} else {
                    req = {account: $item.account.id, amount: $item.qty};
                }
                APIAction[type](req).then(function() {
                    $scope.bar.search = '';
                });
            } else if (type == 'add') {
				Meal.addItem($item.food, $item.qty*$item.food.unit_value);
			}
        };
    }])

.factory('magicbar.analyse',
	['$filter', 'bars.meal', 'auth.user',
	function($filter, Meal, AuthUser) {
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
			qo = qo.replace(/ à /, ' ');
			qo = qo.replace(/ de /, ' ');
	        var terms = qo.split(' ');

	        var humanTypes = {
	            'buy': 'acheter',
	            'throw': 'jeter',
	            'give': 'donner',
	            'punish': 'amende',
	            'appro': 'appro',
				'inventory': 'reste',
				'deposit': 'credit'
	        };
			_.map(humanTypes, function (o, k) {
				if (!AuthUser.can('add_' + k + 'transaction')) {
					delete humanTypes[k];
				}
			});
			humanTypes['add'] = 'ajouter';

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
				var type = _.findKey(humanTypes, function (v) {
					return v.indexOf(term) == 0;
				});
	            if (type) {
	                query.type = type;
					parsedTerms[i].push({
						type: 'type',
						value: type
					});
	                continue;
	            }

	            // Quantity
				// var match = /^([0-9]+(\.[0-9]+)?)(\D*)$/.exec(term);
				var match = /^([0-9.()+\-*/]+)(\D*)$/.exec(term);
	            if (match) {
					try {
						var qty = eval(match[1]);
						var unit = match[2];

						var canBe ={
							type: 'qty',
							value: qty
						};
						if(unit !== '') {
							canBe.unit = unit;
						}

						parsedTerms[i].push(canBe);
					} catch (e) {}
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
				return _.flatten(suggestions);
			}

			query.suggest = _.uniq(_.flatten(_.map(listSuggestions(),
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
						if(res.type !== 'give' && res.type !== 'punish' && res.type !== 'deposit') {
							return []; // Discard
						}
					} else {
						res.otype = 'food';
						if (!res.type && Meal.in()) {
							res.type = 'add';
						} else {
							res.type = res.type || 'buy';
						}
						if((res.type !== 'buy' && res.type !== 'throw' && res.type !== 'appro' && res.type !== 'add' && res.type !== 'inventory')
								|| res.unit === "€"){
							return []; // Discard
						}
					}
					res.qty = res.qty || 1;
					return [res];
			}), true), function (o) {
				var out = o.qty + ";" + o.otype + ";" + o.type + ";";
				if (o.food) {
					out = out + o.food.id;
				} else if (o.account) {
					out = o.account.id;
				}
				return out;
			});


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
