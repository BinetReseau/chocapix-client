'use strict';

angular.module('bars.admin.news', [

])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('bar.admin.news', {
        abstract: true,
        url: "/news",
        template: '<ui-view />'
    })
        .state('bar.admin.news.next-appro', {
            url: '/next-appro',
            templateUrl: "components/admin/news/next-appro.html",
            controller: 'admin.ctrl.news.next-appro',
            resolve: {
                barsettings: ['api.models.barsettings', '$stateParams', function(BarSettings, $stateParams) {
                    return BarSettings.get($stateParams.bar);
                }]
            }
        })
        .state('bar.admin.news.add', {
            url: '/add',
            templateUrl: "components/admin/news/form.html",
            controller: 'admin.ctrl.news.add'
        })
        .state('bar.admin.news.list', {
            url: '/list',
            templateUrl: "components/admin/news/list.html",
            controller: 'admin.ctrl.news.list',
            resolve: {
                news_list: ['api.models.news', function(News) {
                    return News.all();
                }]
            }
        })
        .state('bar.admin.news.edit', {
            url: '/edit/:id',
            templateUrl: "components/admin/news/form.html",
            controller: 'admin.ctrl.news.edit'
        })
    ;
}])

.controller('admin.ctrl.news.next-appro',
    ['$scope', 'api.models.barsettings', 'barsettings', '$state',
    function($scope, APIBarSettings, barsettings, $state){
        $scope.admin.active = 'news';
        $scope.now = new Date();
        $scope.nextAppro = new Date(barsettings.next_scheduled_appro);
        $scope.saveNextAppro = function() {
            barsettings.next_scheduled_appro = $scope.nextAppro.toJSON();
            barsettings.$save().then(function(b) {
                $state.go('bar.admin');
            }, function(errors) {
                console.log('Something went wrong...');
            });
        };
        // Utils functions for datetimepicker
        $scope.time_change = function() {
            if ($scope.ngModel && $scope.time) {
                $scope.ngModel.setHours($scope.time.getHours(), $scope.time.getMinutes());
                $scope.ngModel = new Date($scope.ngModel);
            }
        };
        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };
    }
])
.controller('admin.ctrl.news.add',
    ['$scope', 'api.models.news', 'api.models.user', '$state',
    function($scope, News, User, $state) {
        $scope.formType = 'add';
        $scope.admin.active = 'news';
        $scope.news = News.create();
        $scope.saveNews = function() {
            $scope.news.name = $scope.news.name == '' ? 'Informations' : $scope.news.name;
            $scope.news.deleted = false;
            $scope.news.$save().then(function(newNews) {
                $state.go('bar.admin.news.list');
            }, function(errors) {
                // TODO: display form errors
            });
        };
    }
])
.controller('admin.ctrl.news.list',
    ['$scope', 'api.models.news', 'api.models.account', 'news_list',
    function($scope, News, Account, news_list) {
        $scope.admin.active = 'news';
        $scope.news_list = _.sortBy(news_list, 'last_modified');
        $scope.trash = function(news) {
            news.deleted = true;
            news.$save();
        };
        $scope.untrash = function(news) {
            news.deleted = false;
            news.$save();
        };
        $scope.upNews = function(news) {
            news.$save().then(function() {
                $scope.news_list = _.sortBy(News.all(), 'last_modified');
            });
        }
    }
])
.controller('admin.ctrl.news.edit',
    ['$scope', 'api.models.news', 'api.models.user', '$stateParams', '$state',
    function($scope, News, User, $stateParams, $state) {
        $scope.formType = 'edit';
        $scope.admin.active = 'news';
        $scope.news = News.get($stateParams.id);
        $scope.saveNews = function() {
            $scope.news.name = $scope.news.name == '' ? 'Informations' : $scope.news.name;
            $scope.news.$save().then(function(newNews) {
                $state.go('bar.admin.news.list');
            }, function(errors) {
                    // TODO: display form errors
            });
        };
    }]
)
;
