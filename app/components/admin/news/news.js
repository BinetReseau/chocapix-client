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
            controller: 'admin.ctrl.news.list'
        })
        .state('bar.admin.news.edit', {
            url: '/edit/:id',
            templateUrl: "components/admin/news/form.html",
            controller: 'admin.ctrl.news.edit'
        })
        .state('bar.admin.news.mail', {
            url: '/mail',
            templateUrl: "components/admin/news/mail.html",
            controller: 'admin.ctrl.news.mail'
        })
    ;
}])

.controller('admin.ctrl.news.next-appro',
    ['$scope', 'api.models.barsettings', 'barsettings', '$state',
    function($scope, APIBarSettings, barsettings, $state){
        $scope.admin.active = 'news';
        $scope.now = new Date();
        if (!barsettings.next_scheduled_appro) {
            $scope.nextAppro = new Date();
        } else {
            $scope.nextAppro = new Date(barsettings.next_scheduled_appro);
        }
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
    ['$scope', 'api.models.news', 'api.models.user', '$state', 'news', 'bar',
    function($scope, News, User, $state, news, bar) {
        $scope.formType = 'add';
        $scope.admin.active = 'news';
        $scope.news = News.create();
        $scope.saveNews = function() {
            $scope.news.name = $scope.news.name == '' ? 'Informations' : $scope.news.name;
            $scope.news.deleted = false;
            $scope.news.$save().then(function(newNews) {
                news.push(newNews);
                $state.go('bar.admin.news.list');
            }, function(errors) {
                // TODO: display form errors
            });
        };
    }
])
.controller('admin.ctrl.news.list',
    ['$scope', 'api.models.news', 'api.models.account', 'news', 'bar',
    function($scope, News, Account, news_list, bar) {
        $scope.admin.active = 'news';
        $scope.news_list = news_list;
        $scope.onlyBar = function(n) {
            return n.bar.id == bar.id;
        };
        $scope.trash = function(news) {
            news.deleted = true;
            news.$save();
        };
        $scope.untrash = function(news) {
            news.deleted = false;
            news.$save();
        };
        $scope.upNews = function(news) {
            news.$save();
        };
    }
])
.controller('admin.ctrl.news.edit',
    ['$scope', 'api.models.news', 'api.models.user', '$stateParams', '$state', 'news',
    function($scope, News, User, $stateParams, $state, news) {
        $scope.formType = 'edit';
        $scope.admin.active = 'news';
        $scope.news = _.find(news, function(n) {
            return n.id == $stateParams.id;
        });
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
.controller('admin.ctrl.news.mail',
    ['$scope', 'api.models.account',
    function($scope, Account) {
        $scope.admin.active = 'news';
        var emails_list = _.map(
            _.filter(Account.all(), function(a) { return !a.deleted && a.owner.is_active && a.owner.email; }),
            function (a) {
                return a.owner.email;
            }
        );

        $scope.emails = emails_list.join(', ');
    }
])
;
