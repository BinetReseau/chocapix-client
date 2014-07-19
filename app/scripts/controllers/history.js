'use strict';

angular.module('bars.ctrl.history', [
	])
	.controller('HistoryCtrl',
		['$scope', 
		'API.Transaction', 
		'history', 
		function($scope, Transaction, history) {
			$scope.bar.active = 'history';
			$scope.history = history;
			$scope.updateHistory = function() {
			    $scope.updatingHistory = true;
			    $scope.history =  Transaction.query({}, function () {
				    $scope.updatingHistory = false;
			    });
			};
			$scope.prixTotal = function(h) { // coût total d'une transaction (négatif si on dépense, positif si on est remboursé)
				var somme = 0;
				for (var i = 0; i < h.operations.length; i++) {
					if (h.operations[i].type == 'stockoperation') {
						somme = somme + (h.operations[i].deltaqty * h.operations[i].item.price);
					}
				}
				return somme;
			};
		}
	])
;