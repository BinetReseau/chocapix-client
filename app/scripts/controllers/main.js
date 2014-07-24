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

			$scope.$on('bars.account.update', function(evt, id){
				if(!id || id === $scope.user.account.id) {
					$scope.user.account.$reload();
				}
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
				// Type: acheter|jeter|ajouter|appro|donner
				if (/acheter/i.test(qo)) {
					$scope.query.type = 'acheter';
					qo = qo.replace(/acheter/gi, '');
				} else if (/jeter/i.test(qo)) {
					$scope.query.type = 'jeter';
					qo = qo.replace(/jeter/gi, '');
				} else if (/donner/i.test(qo)) {
					$scope.query.type = 'donner';
					qo = qo.replace(/donner/gi, '');
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
						}
						if (accounts.length == 0) {
							$scope.query.hasError = true;
							$scope.query.errorMessage = 'Aucun utilisateur à ce nom...';
						}
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

				return $scope.query;
			};
			$scope.executeQuery = function() {
				if ($scope.query.food === null && $scope.query.account === null) {
					return;
				}
				if ($scope.query.type == 'acheter') {
					APIAction.buy({item: $scope.query.food.id, qty: $scope.query.qty}).$promise.then(function(transaction){
						$events.$broadcast('bars.action.buy', transaction);
						// $scope.$emit('bars.food.update', $scope.query.food.id);
						// $scope.$emit('bars.account.update', $scope.user.account.id);
						// $scope.$emit('bars.transaction.add', transaction.id);
						$scope.bar.search = '';
					});
				}
				if ($scope.query.type == 'jeter') {
					APIAction.throwaway({item: $scope.query.food.id, qty: $scope.query.qty}).$promise.then(function(transaction){
						$scope.$emit('bars.food.update', $scope.query.food.id);
						$scope.$emit('bars.transaction.add', transaction.id);
						$scope.bar.search = '';
					});
				}
				if ($scope.query.type == 'donner') {
					var id = $scope.query.account.id;
					if (id != $scope.user.account.id) {
						APIAction.give({recipient: id, qty: $scope.query.qty}).then(function(transaction){
							$scope.$emit('bars.account.update', $scope.user.account.id);
							$scope.$emit('bars.account.update', $scope.query.account.id);
							$scope.$emit('bars.transaction.add', transaction.id);
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
