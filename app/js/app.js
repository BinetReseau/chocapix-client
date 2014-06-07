'use strict';


var barsApp = angular.module('barsApp', [
  'ngRoute',
  'ngSanitize',
  'barsApp.filters',
  'barsApp.services',
  'barsApp.directives',
  'barsApp.controllers'
]);

barsApp.config(['$routeProvider',
  function($routeProvider) {
	$routeProvider.
	  when('/', {
		templateUrl: 'partials/index.html',
		controller: 'IndexCtrl'
	  }).
	  when('/:bar', {
		templateUrl: 'partials/bar.html',
		controller: 'BarCtrl'
	  }).
	  when('/:bar/user', {
		templateUrl: 'partials/user.html',
		controller: 'UserCtrl'
	  }).
	  when('/:bar/food/:id', {
		templateUrl: 'partials/food.html',
		controller: 'FoodCtrl'
	  }).
	  when('/:bar', {
		templateUrl: 'partials/serie.html',
		controller: 'SerieCtrl'
	  }).
	  otherwise({
		redirectTo: '/'
	  });
  }]);

barsApp.config(['$routeProvider',
	function ($httpProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
}]);

