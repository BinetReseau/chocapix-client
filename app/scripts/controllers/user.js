'use strict';

angular.module('bars.ctrl.user', [
	])
	.controller('UserDetailCtrl',
		['$scope', 'user', function($scope, user) {
			$scope.UserDetail = user;
		}])
	.controller('UserListCtrl',
		['$scope', 'API.Account', function($scope, Account) {
			$scope.updateUserList = function() {
			    $scope.updatingUserList = true;
			    $scope.bar.accounts =  Account.query({}, function () {
				    $scope.updatingUserList = false;
			    });
			};
		}])
	.controller('UserCtrl',
		['$scope', function($scope) {
			$scope.bar.active = 'user';
		}])
;