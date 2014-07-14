'use strict';

angular.module('bars.ctrl.user', [
	])
	.controller('UserDetailCtrl',
		['$scope', 'user', function($scope, user) {
			$scope.UserDetail = user;
		}])
	.controller('UserListCtrl',
		['$scope', 'API.User', function($scope, User) {
			$scope.updateUserList = function() {
			    $scope.updatingUserList = true;
			    $scope.bar.users =  User.query({}, function () {
				    $scope.updatingUserList = false;
			    });
			};
		}])
	.controller('UserCtrl',
		['$scope', function($scope) {
			$scope.bar.active = 'user';
		}])
;