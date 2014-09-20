'use strict';

angular.module('bars.API', [
    'APIModel'
])

.factory('API', [
    function () {
        var barId = "bar";
        return {
            setBarId: function(barid){
                barId = barid;
            },
            route: function(path){
                // return '/'+barId+'/'+path;
                // return '/../../bars-symfony/web/' + barId + (path==='' ? '' : '/'+path);
                return '/../..' + (path==='' ? '' : '/'+path);
            }
        };
}])

.factory('API.Bar', ['APIModel', 'API',
    function(APIModel, API) {
        return new APIModel({
                url: 'bar',
                type: "Bar",
                structure: {},
                methods: {}
            });
    }])
.factory('API.User', ['APIModel', 'API',
    function(APIModel, API) {
        return new APIModel({
                url: 'user',
                type: "User",
                methods: {
                    'me': {url: 'me', static: true},
                }
            });
    }])
.factory('API.Transaction', ['APIModel', 'API',
    function(APIModel, API) {
        return new APIModel({
                url: 'transaction',
                type: "Transaction",
                structure: {
                    'bar': 'Bar',
                    'author': 'User',
                    'account': 'Account',
                    'item': 'Item'
                },
                methods: {
                }
            });
    }])
.factory('API.Action', ['API.Transaction',
    function(Transaction) {
        var actions = ["buy", "give", "throw", "punish", "appro"];
        var Action = {};
        actions.forEach(function(action) {
            Action[action] = function(params) {
                var transaction = Transaction.create();
                transaction.type = action;
                _.extend(transaction, params);
                return transaction.$save();
            };
        });
        return Action;
    }]);
