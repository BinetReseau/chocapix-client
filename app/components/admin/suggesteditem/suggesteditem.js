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

// .controller('admin.ctrl.suggesteditem.edit',
//     ['$scope', '$timeout', 'api.models.suggested_items', 'api.models.user', '$stateParams', '$state',
//     function($scope, $timeout, SuggestedItem, User, $stateParams, $state) {
//         $scope.admin.active = 'suggested_item';
//         $scope.suggestion = SuggestedItem.get($stateParams.id);
//         $scope.suggestedItems = SuggestedItem.all();
//         var suggested_item = $scope.suggestion;
//
//         $scope.saveSuggestedItem = function(suggestion) { //add a suggestion to the list
//             if (!suggestion) {
//                 return;
//             }
//             suggested_item.name = suggestion;
//             //verify that the new suggestion doesn't already exist
//             if (_.find($scope.suggestedItems, function (item) {
//                 console.log(item);
//                 console.log(suggested_item);
//                 return (_.deburr(item.name.toLocaleLowerCase()) === _.deburr(suggested_item.name.toLocaleLowerCase()))&&(item.id !== suggested_item.id);
//             })) {
//                 $scope.suggestion.alreadyAdded = true;
//                 console.log('existe déjà');
//                 $timeout(function () {
//                     $scope.suggestion.alreadyAdded = false;
//                 }, 2500);
//             } else {
//                 suggested_item.$save();
//                 $state.go('bar.admin.food.suggested_items_list.list');
//             }
//         };
//     }]
// )
;
