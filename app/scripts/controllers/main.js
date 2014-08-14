'use strict';

angular.module('bars.ctrl.main', [
	'bars.filters'
	])
	.controller('MainBaseCtrl',
		['$scope', '$stateParams', 'AuthService', 'API.Me', 'foods', 'bar', 'accounts', 'user', 'account',
		function($scope, $stateParams, AuthService, Me, foods, bar, accounts, user, account) {
			$scope.bar = {
				id: $stateParams.bar,
				name: bar.name,
				accounts: accounts,
				search: '',
				foods: foods,
				active: 'index',
			};
			$scope.user = {
				infos: user,
				isAuthenticated: AuthService.isAuthenticated,
				logout: AuthService.logout,
				account: account
			};
			$scope.login = {
				login: '',
				password: ''
			};

			$scope.connexion = function (login) {
				$scope.loginError = false;
				$scope.inLogin = true;
				AuthService.login(login).then(
					function(user) {
						$scope.user.infos = user;
						$scope.user.account = Me.get();
						$scope.login = {login: '', password: ''};
						$scope.inLogin = false;
					}, function() {
						$scope.loginError = true;
						$scope.login.password = '';
						$scope.inLogin = false;
					}
				);
			};

			$scope.$on('bars.account.update', function(evt, account){
				if(account.id === $scope.user.account.id) {
					$scope.user.account.$reload();
				}
			});
            $scope.$on('bars.account.update', $scope.bar.accounts.$reload);
            $scope.$on('bars.food.add', function(evt, food) {
            	$scope.bar.foods.push(food);
            });
			$scope.$on('bars.food.update', $scope.bar.foods.$reload);

			// bounce events to child scopes
			// ['bars_update_food', 'bars_update_account', 'bars_update_history'].forEach(function(evt_name) {
			// 	$scope.$on(evt_name, function(evt, o){
			// 		if(evt.targetScope !== $scope) {
			// 			console.log({name: evt.name, arg: o});
			// 			evt.stopPropagation();
			// 			$scope.$broadcast(evt_name, o);
			// 		}
			// 	});
			// });
		}])
	.controller('MainFormCtrl',
		['$scope', '$filter', 'API.Food', 'API.Action', '$events',
		function($scope, $filter, Food, APIAction, $events) {
			$scope.query = {
				type: 'acheter',
				qty: 1,
				unit: null,
				name: '',
				hideAnalysis: false,
				hasError: false,
				errorMessage: ''
			};
			$scope.analyse = function(qo) {
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

				// On découpe la requête en termes
				var terms = qo.split(' ');

				var types = [
					'acheter',
					'jeter',
					'donner',
					'amende',
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
					for (var i = (aQty.length - 1); i >= 0; i--) {
						if (aQty[i].used) {
							aQty.splice(i, 1);
						}
					}
					for (var i = (aFoods.length - 1); i >= 0; i--) {
						if (aFoods[i].used) {
							aFoods.splice(i, 1);
						}
					}
					for (var i = (aUnits.length - 1); i >= 0; i--) {
						if (aUnits[i].used) {
							aUnits.splice(i, 1);
						}
					}
					for (var i = (aAccounts.length - 1); i >= 0; i--) {
						if (aAccounts[i].used) {
							aAccounts.splice(i, 1);
						}
					}
				}

				for (var i = 0; i < terms.length; i++) {
					// Type
					if (types.indexOf(terms[i]) > -1) {
						$scope.query.type = terms[i];
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
						//aQty.push(qty);
					}

					// Unité
					if (units.indexOf(terms[i]) > -1) {
						item.isUnit = true;
						item.unit = terms[i];
						aUnits.push(item);
						console.log(item);
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
							console.log(itemu);
						}
					}

					// Food
					var foods = $filter('filter')($scope.bar.foods, terms[i], false);
					if (foods.length == 0) {
						var foods = $filter('filter')($scope.bar.foods, terms[i].replace(/s$/, ''), false);
					}
					if (foods.length == 1) {
						item.isFood = true;
						item.food = foods[0];
						//aFoods.push(foods[0]);
					}

					// Push food et quantité
					if (item.isQty) {
						aQty.push(item);
					}
					if (item.isFood) {
						aFoods.push(item);
					}

					// Account
					var accounts = $filter('filter')($scope.bar.accounts, terms[i], false);
					if (accounts.length == 1) {
						aAccounts.push(accounts[0]);
					}
				}

				console.log("Barre magique :");
				console.log(aQty);
				console.log(aFoods);
				console.log(aUnits);
				console.log(aAccounts);

				function analyseTerms() {
					// Réflexion et exécution
					if (aFoods.length == 1) {
						aFoods[0].used = true;
						$scope.query.food = aFoods[0].food;
						if ($scope.query.type == '') {
							$scope.query.type = 'acheter';
						}
						cleana();
					}
					if (aAccounts.length == 1) {
						$scope.query.account = aAccounts[0];
						if ($scope.query.type == '') {
							$scope.query.type = 'donner';
						}
						aAccounts[0].used = true;
						cleana();
					}
					if (aQty.length == 1) {
						$scope.query.qty = aQty[0].qty;
						aQty[0].used = true;
						cleana();
						if (aUnits.length == 1 && $scope.query.food !== null) {
							$scope.query.unit = aUnits[0].unit;
							aUnits[0].used = true;
							cleana();
							if ((/^k/i.test($scope.query.food.unit) && !/^k/i.test($scope.query.unit)) || (!/^m/i.test($scope.query.food.unit) && /^m/i.test($scope.query.unit))) {
								$scope.query.qty *= 0.001;
							} else if ((!/^k/i.test($scope.query.food.unit) && /^k/i.test($scope.query.unit)) || (/^m/i.test($scope.query.food.unit) && !/^m/i.test($scope.query.unit))) {
								$scope.query.qty *= 1000;
							} else if (/^c/i.test($scope.query.food.unit) && !/^c/i.test($scope.query.unit)) {
								$scope.query.qty *= 100;
							} else if (!/^c/i.test($scope.query.food.unit) && /^c/i.test($scope.query.unit)) {
								$scope.query.qty *= 0.01;
							}
						}
					}
					if ($scope.query.food !== null) {
						$scope.query.unit = $scope.query.food.unit;
					}
				}
				analyseTerms();
				analyseTerms();
				analyseTerms();

				console.log($scope.query);

				return $scope.query;

				// Type: acheter|jeter|ajouter|appro|donner|amende
				if (/acheter/i.test(qo)) {
					$scope.query.type = 'acheter';
					qo = qo.replace(/acheter/gi, '');
				} else if (/jeter/i.test(qo)) {
					$scope.query.type = 'jeter';
					qo = qo.replace(/jeter/gi, '');
				} else if (/donner/i.test(qo)) {
					$scope.query.type = 'donner';
					qo = qo.replace(/donner/gi, '');
				} else if (/amende/i.test(qo)) {
					$scope.query.type = 'amende';
					qo = qo.replace(/amende/gi, '');
				} else if (/appro/i.test(qo)) {
					$scope.query.type = 'appro';
					qo = qo.replace(/appro/gi, '');
				}

				// Type : acheter
				if ($scope.query.type == '' || $scope.query.type == 'acheter') {
					var q = qo;
					// Quantity + unit
					if (/([0-9]+(\.|,[0-9]+)?) *([a-z]{1,2}) /ig.test(q)) {
						$scope.query.qty = q.replace(/^(.*[^0-9,.])?([0-9]+(\.|,[0-9]+)?) *([a-z]{1,2}) .*$/ig, '$2').replace(/,/, '.');
						$scope.query.unit = q.replace(/^(.*[^0-9,.])?([0-9]+(\.|,[0-9]+)?) *([a-z]{1,2}) .*$/ig, '$4');
						q = q.replace(/([0-9]+(\.[0-9]+)?) *([a-z]{1,2}) /ig, ' ');
					} else if (/([0-9]+(\.|,[0-9]+)?) *([a-z]{1,2})$/ig.test(q)) {
						$scope.query.qty = q.replace(/^(.*[^0-9,.])?([0-9]+(\.|,[0-9]+)?) *([a-z]{1,2})$/ig, '$2').replace(/,/, '.');
						$scope.query.unit = q.replace(/^(.*[^0-9,.])?([0-9]+(\.|,[0-9]+)?) *([a-z]{1,2})$/ig, '$4');
						q = q.replace(/([0-9]+(\.|,[0-9]+)?) *([a-z]{1,2})$/ig, '');
					} else { // Quantity without unit
						if (/1664/.test(q)) {
							$scope.query.name = '1664';
							q = q.replace(/1664/g, '');
							$scope.query.qty = q.replace(/^(.*[^0-9.,])?([0-9]+(\.|,[0-9]+)?).*$/, '$2').replace(/,/, '.');
						}
						$scope.query.qty = q.replace(/^(.*[^0-9.,])?([0-9]+(\.|,[0-9]+)?).*$/g, '$2').trim();
						if ($scope.query.qty == q.trim()) {
							$scope.query.qty = 1;
						}
						q = q.replace(/([0-9]+(\.|,[0-9]+)?)/g, '')
					}

					// Aliment
					q = q.replace(/( de )|( d')/gi, '');
					q = q.replace(/ +/g, '');
					q = q.trim();
					if ($scope.query.name == '') {
						$scope.query.name = q;
					}

					var foods = $filter('filter')($scope.bar.foods, $scope.query.name, false);
					if (foods.length == 0) {
						var foods = $filter('filter')($scope.bar.foods, $scope.query.name.replace(/s$/, ''), false);
					}

					if ($scope.query.type == 'acheter' && foods.length == 0) {
						$scope.query.hasError = true;
						$scope.query.errorMessage = 'Cet aliment n\'existe pas dans ce bar.';
					}

					if (foods.length == 1) {
						$scope.query.type = 'acheter';
						$scope.query.food = foods[0];

						if ($scope.query.unit != '' && $scope.query.food.unit != '') {
							if ((/^k/i.test($scope.query.food.unit) && !/^k/i.test($scope.query.unit)) || (!/^m/i.test($scope.query.food.unit) && /^m/i.test($scope.query.unit))) {
								$scope.query.qty *= 0.001;
							} else if ((!/^k/i.test($scope.query.food.unit) && /^k/i.test($scope.query.unit)) || (/^m/i.test($scope.query.food.unit) && !/^m/i.test($scope.query.unit))) {
								$scope.query.qty *= 1000;
							} else if (/^c/i.test($scope.query.food.unit) && !/^c/i.test($scope.query.unit)) {
								$scope.query.qty *= 100;
							} else if (!/^c/i.test($scope.query.food.unit) && /^c/i.test($scope.query.unit)) {
								$scope.query.qty *= 0.01;
							}
						}

						$scope.query.unit = $scope.query.food.unit;
					}
				}

				// Type : donner
				if ($scope.query.type == '' || $scope.query.type == 'donner') {
					var q = qo;
					$scope.query.qty = q.replace(/^(.*[^0-9€.,os])?([0-9]+(((\.)|€|,|(euro(s?)))[0-9]+)?).*$/g, '$2').replace(/€/, '.');
					if ($scope.query.qty != q) {
						q = q.replace(/(euros?)|€/i, '');
						q = q.replace(/ à|a /i, '');
						q = q.replace(/([0-9]+(\.[0-9]+)?)/g, '').trim();

						var accounts = $filter('filter')($scope.bar.accounts, q, false);
						if (accounts.length == 1) {
							$scope.query.type = 'donner';
							$scope.query.account = accounts[0];
							if ($scope.user.account.id == $scope.query.account.id) {
								$scope.query.hideAnalysis = true;
								$scope.query.hasError = true;
								$scope.query.errorMessage = 'Réfléchis mon grand ! On ne peut pas se faire de don à soi-même !';
							}
							if ($scope.query.qty <= 0) {
								$scope.query.hideAnalysis = true;
								$scope.query.hasError = true;
								$scope.query.errorMessage = 'On ne peut donner que des montants strictement positifs.';
							}
						}
						if (accounts.length == 0 && $scope.query.type == 'donner') {
							$scope.query.hasError = true;
							$scope.query.errorMessage = 'Aucun utilisateur à ce nom dans ce bar.';
						}
					}
				}

				// Type : appro
				if ($scope.query.type == '' || $scope.query.type == 'appro') {
					var q = qo;
					// Quantity + unit
					if (/([0-9]+(\.|,[0-9]+)?) *([a-z]{1,2}) /ig.test(q)) {
						$scope.query.qty = q.replace(/^(.*[^0-9,.])?([0-9]+(\.|,[0-9]+)?) *([a-z]{1,2}) .*$/ig, '$2').replace(/,/, '.');
						$scope.query.unit = q.replace(/^(.*[^0-9,.])?([0-9]+(\.|,[0-9]+)?) *([a-z]{1,2}) .*$/ig, '$4');
						q = q.replace(/([0-9]+(\.[0-9]+)?) *([a-z]{1,2}) /ig, ' ');
					} else if (/([0-9]+(\.|,[0-9]+)?) *([a-z]{1,2})$/ig.test(q)) {
						$scope.query.qty = q.replace(/^(.*[^0-9,.])?([0-9]+(\.|,[0-9]+)?) *([a-z]{1,2})$/ig, '$2').replace(/,/, '.');
						$scope.query.unit = q.replace(/^(.*[^0-9,.])?([0-9]+(\.|,[0-9]+)?) *([a-z]{1,2})$/ig, '$4');
						q = q.replace(/([0-9]+(\.|,[0-9]+)?) *([a-z]{1,2})$/ig, '');
					} else { // Quantity without unit
						if (/1664/.test(q)) {
							$scope.query.name = '1664';
							q = q.replace(/1664/g, '');
							$scope.query.qty = q.replace(/^(.*[^0-9.,])?([0-9]+(\.|,[0-9]+)?).*$/, '$2').replace(/,/, '.');
						}
						$scope.query.qty = q.replace(/^(.*[^0-9.,])?([0-9]+(\.|,[0-9]+)?).*$/g, '$2').trim();
						if ($scope.query.qty == q.trim()) {
							$scope.query.qty = 1;
						}
						q = q.replace(/([0-9]+(\.|,[0-9]+)?)/g, '')
					}

					// Aliment
					q = q.replace(/( de )|( d')/gi, '');
					q = q.replace(/ +/g, '');
					q = q.trim();
					if ($scope.query.name == '') {
						$scope.query.name = q;
					}

					var foods = $filter('filter')($scope.bar.foods, $scope.query.name, false);
					if (foods.length == 0) {
						var foods = $filter('filter')($scope.bar.foods, $scope.query.name.replace(/s$/, ''), false);
					}

					if ($scope.query.type == 'appro' && foods.length == 0) {
						$scope.query.hasError = true;
						$scope.query.errorMessage = 'Cet aliment n\'existe pas dans ce bar.';
					}

					if (foods.length == 1) {
						$scope.query.type = 'appro';
						$scope.query.food = foods[0];

						if ($scope.query.unit != '' && $scope.query.food.unit != '') {
							if ((/^k/i.test($scope.query.food.unit) && !/^k/i.test($scope.query.unit)) || (!/^m/i.test($scope.query.food.unit) && /^m/i.test($scope.query.unit))) {
								$scope.query.qty *= 0.001;
							} else if ((!/^k/i.test($scope.query.food.unit) && /^k/i.test($scope.query.unit)) || (/^m/i.test($scope.query.food.unit) && !/^m/i.test($scope.query.unit))) {
								$scope.query.qty *= 1000;
							} else if (/^c/i.test($scope.query.food.unit) && !/^c/i.test($scope.query.unit)) {
								$scope.query.qty *= 100;
							} else if (!/^c/i.test($scope.query.food.unit) && /^c/i.test($scope.query.unit)) {
								$scope.query.qty *= 0.01;
							}
						}

						$scope.query.unit = $scope.query.food.unit;
					}
				}

				// Type : jeter
				if ($scope.query.type == '' || $scope.query.type == 'jeter') {
					var q = qo;
					// Quantity + unit
					if (/([0-9]+(\.[0-9]+)?) *([a-z]{1,2}) /ig.test(q)) {
						$scope.query.qty = q.replace(/^(.*[^0-9.])?([0-9]+(\.[0-9]+)?) *([a-z]{1,2}) .*$/ig, '$2');
						$scope.query.unit = q.replace(/^(.*[^0-9.])?([0-9]+(\.[0-9]+)?) *([a-z]{1,2}) .*$/ig, '$4');
						q = q.replace(/([0-9]+(\.[0-9]+)?) *([a-z]{1,2}) /ig, ' ');
					} else if (/([0-9]+(\.[0-9]+)?) *([a-z]{1,2})$/ig.test(q)) {
						$scope.query.qty = q.replace(/^(.*[^0-9.])?([0-9]+(\.[0-9]+)?) *([a-z]{1,2})$/ig, '$2');
						$scope.query.unit = q.replace(/^(.*[^0-9.])?([0-9]+(\.[0-9]+)?) *([a-z]{1,2})$/ig, '$4');
						q = q.replace(/([0-9]+(\.[0-9]+)?) *([a-z]{1,2})$/ig, '');
					} else { // Quantity without unit
						if (/1664/.test(q)) {
							$scope.query.name = '1664';
							q = q.replace(/1664/g, '');
							$scope.query.qty = q.replace(/^(.*[^0-9.])?([0-9]+(\.[0-9]+)?).*$/, '$2');
						}
						$scope.query.qty = q.replace(/^(.*[^0-9.])?([0-9]+(\.[0-9]+)?).*$/g, '$2').trim();
						if ($scope.query.qty == q.trim()) {
							$scope.query.qty = 1;
						}
						q = q.replace(/([0-9]+(\.[0-9]+)?)/g, '')
					}

					// Aliment
					q = q.replace(/( de )|( d')/gi, '');
					q = q.replace(/ +/g, '');
					q = q.trim();
					if ($scope.query.name == '') {
						$scope.query.name = q;
					}

					var foods = $filter('filter')($scope.bar.foods, $scope.query.name, false);
					if (foods.length == 0) {
						var foods = $filter('filter')($scope.bar.foods, $scope.query.name.replace(/s$/, ''), false);
					}

					if ($scope.query.type == 'jeter' && foods.length == 0) {
							$scope.query.hasError = true;
							$scope.query.errorMessage = 'Cet aliment n\'existe pas dans ce bar.';
						}

					if (foods.length == 1) {
						$scope.query.type = 'jeter';
						$scope.query.food = foods[0];

						if ($scope.query.unit != '' && $scope.query.food.unit != '') {
							if ((/^k/i.test($scope.query.food.unit) && !/^k/i.test($scope.query.unit)) || (!/^m/i.test($scope.query.food.unit) && /^m/i.test($scope.query.unit))) {
								$scope.query.qty *= 0.001;
							} else if ((!/^k/i.test($scope.query.food.unit) && /^k/i.test($scope.query.unit)) || (/^m/i.test($scope.query.food.unit) && !/^m/i.test($scope.query.unit))) {
								$scope.query.qty *= 1000;
							} else if (/^c/i.test($scope.query.food.unit) && !/^c/i.test($scope.query.unit)) {
								$scope.query.qty *= 100;
							} else if (!/^c/i.test($scope.query.food.unit) && /^c/i.test($scope.query.unit)) {
								$scope.query.qty *= 0.01;
							}
						}

						$scope.query.unit = $scope.query.food.unit;
					}
				}

				// Type : amende
				if ($scope.query.type == '' || $scope.query.type == 'amende') {
					var q = qo;
					$scope.query.qty = q.replace(/^(.*[^0-9€.,os])?([0-9]+(((\.)|€|,|(euro(s?)))[0-9]+)?).*$/g, '$2').replace(/€/, '.');
					if ($scope.query.qty != q) {
						q = q.replace(/(euros?)|€/i, '');
						q = q.replace(/ à|a /i, '');
						q = q.replace(/([0-9]+(\.[0-9]+)?)/g, '').trim();

						var accounts = $filter('filter')($scope.bar.accounts, q, false);
						if (accounts.length == 1) {
							$scope.query.type = 'amende';
							$scope.query.account = accounts[0];
							if ($scope.query.qty <= 0) {
								$scope.query.hideAnalysis = true;
								$scope.query.hasError = true;
								$scope.query.errorMessage = 'On ne peut pas mettre d\'amende négative.';
							}
						}
						if (accounts.length == 0 && $scope.query.type == 'amende') {
							$scope.query.hasError = true;
							$scope.query.errorMessage = 'Aucun utilisateur à ce nom dans ce bar.';
						}
					}
				}

				return $scope.query;
			};
			$scope.executeQuery = function() {
				if ($scope.query.food === null && $scope.query.account === null) {
					return;
				}
				if ($scope.query.type == 'acheter') {
					if (!$scope.query.hasError) {
						APIAction.buy({item: $scope.query.food.id, qty: $scope.query.qty}).$promise.then(function(transaction) {
							$events.$broadcast('bars.transaction.new', transaction);
							$scope.bar.search = '';
						});
					}
				}
				if ($scope.query.type == 'jeter') {
					if (!$scope.query.hasError) {
						APIAction.throwaway({item: $scope.query.food.id, qty: $scope.query.qty}).$promise.then(function(transaction) {
							$events.$broadcast('bars.transaction.new', transaction);
							$scope.bar.search = '';
						});
					}
				}
				if ($scope.query.type == 'donner') {
					var id = $scope.query.account.id;
					if (!$scope.query.hasError) {
						APIAction.give({recipient: id, qty: $scope.query.qty}).$promise.then(function(transaction) {
							$events.$broadcast('bars.transaction.new', transaction);
							$scope.bar.search = '';
						});
					}
				}
				if ($scope.query.type == 'amende') {
					var id = $scope.query.account.id;
					if (!$scope.query.hasError) {
						APIAction.punish({accused: id, qty: $scope.query.qty, motive: 'A renseigner...'}).$promise.then(function(transaction) {
							$events.$broadcast('bars.transaction.new', transaction);
							$scope.bar.search = '';
						});
					}
				}
				if ($scope.query.type == 'appro') {
					if (!$scope.query.hasError) {
						APIAction.appro({item: $scope.query.food.id, qty: $scope.query.qty}).$promise.then(function(transaction) {
							$events.$broadcast('bars.transaction.new', transaction);
							$scope.bar.search = '';
						});
					}
				}
			};
		}])
	.controller(
		'MainBarCtrl',
		['$scope', function($scope) {
			$scope.bar.active = 'index';
			document.getElementById("queryf").focus();
		}])
;
