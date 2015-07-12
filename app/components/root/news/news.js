'use strict';

angular.module('bars.root.news', [
    //
])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('root.news', {
        abstract: true,
        url: "/news",
        template: "<ui-view />",
        controller: ['$scope', function($scope) {
            $scope.root.active = 'news';
        }]
    })
        .state('root.news.base', {
            url: '/home',
            templateUrl: "components/root/news/home.html",
            controller: 'root.ctrl.news.base'
        })
        .state('root.news.add', {
            url: '/add',
            templateUrl: "components/root/news/form.html",
            controller: 'root.ctrl.news.add'
        })
        .state('root.news.edit', {
            url: '/edit/:id',
            templateUrl: "components/root/news/form.html",
            controller: 'root.ctrl.news.edit'
        })
}])

.controller('root.ctrl.news.base', 
    ['$scope', 'api.models.news', 'news_list', 
    function($scope, News, news_list) {
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
        };
    }]
)

.controller('root.ctrl.news.add',
    ['$scope', 'api.models.news', 'api.models.user', '$state', 'news_list', 
    function($scope, News, User, $state, news_list) {
        $scope.formType = 'add';
        $scope.news = News.create();
        $scope.news.bar = 'root';

        $scope.saveNews = function() {
            $scope.news.name = $scope.news.name == '' ? 'Informations' : $scope.news.name;
            $scope.news.deleted = false;
            $scope.news.model.save($scope.news).then(function(newNews) {
                news_list.push(newNews);
                $state.go('root.news.base');
            }, function(errors) {
                // TODO: display form errors
            });
        };
    }
])

.controller('root.ctrl.news.edit',
    ['$scope', 'api.models.news', 'api.models.user', '$stateParams', '$state',
    function($scope, News, User, $stateParams, $state) {
        $scope.formType = 'edit';
        $scope.news = News.get($stateParams.id);

        $scope.saveNews = function() {
            $scope.news.name = $scope.news.name == '' ? 'Informations' : $scope.news.name;
            $scope.news.$save().then(function(newNews) {
                $state.go('root.news.base');
            }, function(errors) {
                    // TODO: display form errors
            });
        };
    }]
)
;