'use strict';

angular.module('bars.magicbar', [
	'bars.filters'
])

.controller('magicbar.ctrl',
    ['$scope', '$rootScope', '$filter', '$modal', '$timeout', 'auth.user', 'api.services.action', 'api.models.buyitem', 'api.models.sellitem', 'magicbar.analyse', 'bars.meal',
    function($scope, $rootScope, $filter, $modal, $timeout, AuthUser, APIAction, BuyItem, SellItem, analyse, Meal) {
		// MagicBar sorting
		function cleanRanking() {
			_.forEach(SellItem.all(), function (si) {
				si.urank = 0;
			});
			_.forEach(AuthUser.menus, function (menu) {
				menu.urank = 0;
			})
		}
		function updateRanking() {
			if (!AuthUser.account) {
				return;
			}
			AuthUser.account.magicbar_ranking({})
			.then(function (ranking) {
				_.forEach(ranking, function (r) {
					SellItem.get(r.id).urank = r.val;
				});
				_.forEach(AuthUser.menus, function (menu) {
					menu.updateRank();
				});
			});
		}
		updateRanking();
		$rootScope.$on('auth.hasLoggedIn', updateRanking);
		$rootScope.$on('auth.hasLoggedOut', updateRanking);


        $scope.query = {
            type: 'buy',
            qty: 1,
            unit_name: null,
            name: '',
            hideAnalysis: false,
            hasError: false,
            errorMessage: '',
            suggest: []
        };

        $scope.$watch('bar.search', function(qo) {
            analyse(qo, $scope);
        });
		$scope.urank = function (e) {
			if (e.food && e.food.urank > 0) {
				return -e.food.urank;
			} else if (e.menu && e.menu.urank > 0) {
				return -e.menu.urank;
			} else {
				return 0;
			}
		};

		$scope.convertBarcode = function (e) {
			if ((e.which === 13) && ($scope.bar.search != '')) {
				var barcode = $scope.bar.search;
				if (barcode && !isNaN(barcode)) {
					var buy_item = _.find(BuyItem.all(), function (bi) {
						return bi.filter(barcode);
					});
					if (buy_item) {
						$scope.bar.search = buy_item.details.stockitem.sellitem.name;
						$('#q_alim').eq(0).val(buy_item.details.stockitem.sellitem.name + " ").trigger("input");
					}
				}
			}
		};

        $scope.executeQuery = function($item, $model, $label) {
            if ($item.food === null && $item.account === null && $item.menu === null) {
                return;
            }
            var type = $item.type;

            if(_.contains(['buy', 'throw', 'give', 'appro', 'inventory', 'deposit'], type)) {
                var req;
                if(_.contains(['buy', 'throw'], type)) {
                    req = {sellitem: $item.food.id, qty: $item.qty/**$item.food.unit_value*/};
                } else if(_.contains(['inventory', 'appro'], type)) {
					req = {items:
						[{
							item: $item.food.id,
							qty: $item.qty/**$item.food.unit_value*/
						}]
					};
				} else {
					req = {account: $item.account.id, amount: $item.qty};
				}
                APIAction[type](req).then(function() {
                    $scope.bar.search = '';
                });
            } else if (_.contains(['buymenu', 'addmenu'], type)) {
				if (!Meal.in()) {
					Meal.name = $item.menu.name;
				}
				_.forEach($item.menu.items, function (item) {
					Meal.addItem(item.sellitem, item.qty*$item.qty, type == 'buymenu');
				});
				if (type == 'buymenu') {
					Meal.validate();
				}
			} else if (_.contains(['punish', 'refund', 'withdraw'], type)) {
				var req = {account: $item.account.id, amount: $item.qty, motive: ''};
				$timeout(function () {
					document.getElementById('mmotive').focus();
				}, 500);
				var modalMotive = $modal.open({
	                templateUrl: 'components/magicbar/modal-motive.html',
	                controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
	                    $scope.req = req;
	                    $scope.submit = function() {
							APIAction[type](req).then(function() {
								$modalInstance.close();
								$timeout(function () {
									document.getElementById('q_alim').focus();
								}, 500);
			                });
	                    };
	                    $scope.cancel = function () {
	                        $modalInstance.dismiss('cancel');
	                    };
	                }],
	                size: 'lg'
	            });
			} else if (type == 'add') {
				Meal.addItem($item.food, $item.qty/**$item.food.unit_value*/);
			}
        };
    }])

.factory('magicbar.analyse',
	['$filter',  'api.models.sellitem', 'api.models.buyitem', 'bars.meal', 'auth.user',
	function($filter, SellItem, BuyItem, Meal, AuthUser) {
	    var analyse = function(qo, $scope) {
	        $scope.query = {
	            type: '',
	            qty: 1,
	            unit_name: '',
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
	            //'throw': 'jeter',
	            'give': 'donner',
	            'punish': 'amende',
	            //'appro': 'appro',
				//'inventory': 'reste',
				'deposit': 'credit',
				'refund': 'rembourser',
				'withdraw': 'retirer'
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
			var unitsr = {
				'g': {
					'kg': 1000,
					'g': 1
				},
				'kg': {
					'g': 0.001,
					'kg': 1
				},
				'l': {
					'ml': 0.001,
					'cl': 0.01,
					'l': 1
				},
				'cl': {
					'l': 100,
					'ml': 0.1,
					'cl': 1
				},
				'ml': {
					'l': 1000,
					'cl': 10,
					'ml': 1
				}
			};


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
						var unit_name = match[2];

						var pitem = {
							type: 'qty',
							value: qty
						};

						if(unit_name !== '' && units.indexOf(unit_name) > -1) {
							pitem.unit_name = unit_name;
						}

						parsedTerms[i].push(pitem);
					} catch (e) {}
	            }

	            // Unit
	            if (units.indexOf(term) > -1) {
					parsedTerms[i].push({
						type: 'unit_name',
						value: term
					});
	            }

	            // Food
	            var foods = _.filter(SellItem.all(), function (o) {
					return o.filter(term);
	            });
	            if (foods.length === 0) {
	                foods = _.filter(SellItem.all(), function (o) {
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

				// Menu
				var menus = _.filter(AuthUser.menus, function (o) {
					return o.filter(term);
	            });
	            if (menus.length >= 1) {
					_.forEach(menus, function(a) {
						parsedTerms[i].push({
							type: 'menu',
							value: a
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
					if(hasType(suggestion, 'food') || hasType(suggestion, 'account') || hasType(suggestion, 'menu')) {
						return [suggestion];
					} else {
						return [];
					}
				}
				var suggestions = [];
				for(var j = 0; j < parsedTerms[i].length; j++) {
					var canBe = parsedTerms[i][j];
					if((canBe.type === 'qty' || canBe.type === 'unit_name' || canBe.type === 'type') && hasType(suggestion, canBe.type)) {
						continue;
					} else if(canBe.type === 'account' && (hasType(suggestion, 'food') || hasType(suggestion, 'menu'))) {
						continue;
					} else if(canBe.type === 'food' && (hasType(suggestion, 'account') || hasType(suggestion, 'menu'))) {
						continue;
					} else if(canBe.type === 'menu' && (hasType(suggestion, 'account') || hasType(suggestion, 'food'))) {
						continue;
					} else if(canBe.type === 'account' || canBe.type === 'food' || canBe.type === 'menu') {
						var other = _.find(suggestion, {type:canBe.type});
						if(other && other.value !== canBe.value) {
							continue;
						} else if (other) { // Do not add food again
							suggestions.push(listSuggestions(i+1, suggestion));
							continue;
						}
					}

					var nsuggestion = _.clone(suggestion);
					if (canBe.unit_name) {
						var canBe2 = {
							type: 'unit_name',
							value: canBe.unit_name
						};
						delete canBe.unit_name;
						nsuggestion.push(canBe2);
					}
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
					});
					if(_.find(suggestion, {type:'account'})) {
						res.otype = 'account';
						res.type = res.type || 'give';
						if(res.type !== 'give' && res.type !== 'punish' && res.type !== 'deposit' && res.type !== 'refund' && res.type !== 'withdraw') {
							return []; // Discard
						}
					} else if(_.find(suggestion, {type:'menu'})) {
						res.otype = 'menu';
						if (!res.type && Meal.in()) {
							res.type = 'addmenu';
						}
						res.type = res.type || 'buy';
						if (res.type == 'add') {
							res.type = 'addmenu';
						} else if (res.type == 'buy') {
							res.type = 'buymenu';
						}
						if(res.type !== 'buymenu' && res.type !== 'addmenu') {
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
								|| res.unit_name === "€"){
							return []; // Discard
						}
						if (res.unit_name) {
							if (unitsr[res.unit_name][res.food.unit_name]) {
								res.qty = res.qty / unitsr[res.unit_name][res.food.unit_name];
							} else {
								var sti = _.find(res.food.stockitems, function (si) {
									return unitsr[res.unit_name][si.details.unit];
								});
								if (sti) {
									res.qty = res.qty / unitsr[res.unit_name][sti.details.unit] / sti.details.container_qty / sti.sell_to_buy;
								}
							}
						}
					}
					res.qty = res.qty || 1;
					return [res];
			}), true), function (o) {
				var out = o.qty + ";" + o.otype + ";" + o.type + ";";
				if (o.food) {
					out = out + o.food.id;
				} else if (o.account) {
					out = out + o.account.id;
				} else if (o.menu) {
					out = out + o.menu.id;
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
