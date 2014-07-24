'use strict';

angular.module('bars.events', [
])

.factory('$events', ['$rootScope',
	function ($rootScope) {
		function removeFromArray(array, val) {
			var index = array.indexOf(val);
			if(index > -1) {
				return array.splice(index, 1);
			}
		}

		// For an event name, transformers[name] should be a function taking an argument and returning an array of new events
		// and arguments as {evt: ,arg:}
		var transformers = {};
		function addEventTransformer(evt, trfn) {
			console.log('Added transformEvent', evt, trfn);
			transformers[evt] = transformers[evt] || [];
			transformers[evt].push(trfn);
			return function() {
				removeFromArray(transformers[evt], trfn);
			};
		}
		function transformEvent(evt, arg) {
			var stack = [], ret = [];
			stack.push({evt:evt, arg:arg});
			var e, tr, new_evts;
			while(e = stack.pop()){
				if(transformers[e.evt]) {
					transformers[e.evt].forEach(function(trfn) {
						if(angular.isString(trfn))
							new_evts = [{evt: trfn, arg: e.arg}];
						else if(angular.isFunction(trfn))
							new_evts = trfn(e.arg);
						new_evts.forEach(function(x){stack.push(x);});
					})
				}
				ret.push(e);
			}
			return ret;
		}
		return {
			addEventTransformer: addEventTransformer,
			$broadcast: function(evt, arg) {
				var events = transformEvent(evt, arg);
				console.log('event asked: ' + evt, arg);
				angular.forEach(events, function(o){
					console.log('event fired: ' + o.evt, o.arg);
					$rootScope.$broadcast(o.evt, o.arg);
				});
			}
		};
}]);
