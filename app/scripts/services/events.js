'use strict';

angular.module('bars.events', [
])

.factory('$events', ['$rootScope',
	function ($rootScope) {
		return {
			$broadcast: function() {
				$rootScope.$broadcast.apply($rootScope, arguments);
			}
		};
}]);
