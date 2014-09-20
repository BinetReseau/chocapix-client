'use strict';

angular.module('bars.api.transaction', [
    'APIModel'
    ])

.factory('api.models.transaction', ['APIModel',
    function(APIModel) {
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

.factory('api.services.action', ['api.models.transaction',
    function(Transaction) {
        var actions = ["buy", "give", "throw", "punish", "appro"];
        var Action = {};
        actions.forEach(function(action) {
            Action[action] = function(params) {
                var transaction = Transaction.create(params);
                transaction.type = action;
                // _.extend(transaction, params);
                return transaction.$save();
            };
        });
        return Action;
    }])
;
