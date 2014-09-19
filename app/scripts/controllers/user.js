'use strict';

angular.module('bars.ctrl.user', [
	])
	.controller('UserDetailCtrl',
		['$scope', 'user', 'history', function($scope, user, history) {
			$scope.UserDetail = user;
			$scope.history = history;
		}])
	.controller('UserListCtrl',
		['$scope', 'API.Account', function($scope, Account) {
			$scope.updateUserList = function() {
			    $scope.updatingUserList = true;
			    $scope.bar.accounts.$reload().then(function () {
				    $scope.updatingUserList = false;
			    });
			};
		}])
	.controller('UserCtrl',
		['$scope', function($scope) {
			$scope.bar.active = 'user';
		}])
;
