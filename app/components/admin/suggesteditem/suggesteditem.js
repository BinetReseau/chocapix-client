'use strict';

angular.module('bars.admin.suggesteditem', [

])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('bar.admin.suggesteditem', {
        url: '/suggesteditem',
        abstract: true,
        template: "<ui-view />",
        controller: 'admin.ctrl.suggesteditem'
    })
        .state('bar.admin.suggesteditem.list', {
            url: "/list",
            templateUrl: "components/admin/suggesteditem/suggesteditem.list.html",
            controller: 'admin.ctrl.suggesteditem.list'
        })
        .state('bar.admin.suggesteditem.edit', { //allow administrator to edit suggestions
            url: '/edit/:id',
            templateUrl: "components/admin/suggesteditem/suggesteditem.form.html",
            controller: 'admin.ctrl.suggesteditem.edit'
        })
    ;
}])

.controller('admin.ctrl.suggesteditem',
    ['$scope', function ($scope) {
        $scope.admin.active = 'suggesteditem';
    }]
)

.controller('admin.ctrl.suggesteditem.list',
    ['$scope', 'api.models.suggesteditem', 'api.models.user', 'suggesteditems',
    function($scope, SuggestedItem, User, suggesteditems) {
        $scope.suggesteditems = suggesteditems;
        $scope.list_order = '-voters_list.length';

        $scope.trash = function(suggested_item) {
            suggested_item.added = true;
            suggested_item.$save();
        };
        $scope.untrash = function(suggested_item) {
            suggested_item.added = false;
            suggested_item.$save();
        };
        $scope.delete = function(suggested_item) {
            suggested_item.$delete();
        };
    }
])

.controller('admin.ctrl.suggesteditem.edit',
    ['$scope', '$timeout', 'api.models.suggesteditem', 'api.models.user', '$stateParams', '$state', 'suggesteditems',
    function($scope, $timeout, SuggestedItem, User, $stateParams, $state, suggesteditems) {
        $scope.suggesteditem = SuggestedItem.get($stateParams.id);
        $scope.alreadyAdded = false;

        $scope.saveSuggestedItem = function(suggesteditem) { //add a suggestion to the list
            if (!suggesteditem.name) {
                return;
            }

            // Verify that the new suggestion doesn't already exist
            if (_.find(suggesteditems, function (item) {
                return (_.deburr(item.name.toLocaleLowerCase()) === _.deburr(suggesteditem.name.toLocaleLowerCase())) && (item.id !== suggesteditem.id);
            })) {
                $scope.alreadyAdded = true;
                $timeout(function () {
                    $scope.alreadyAdded = false;
                }, 2500);
            } else {
                suggesteditem.$save().then(function() {
                    $state.go('bar.admin.suggesteditem.list');
                });
            }
        };
    }]
)
;
