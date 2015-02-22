'use strict';

angular.module('bars.main', [
    'bars.filters'
    ])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('bar', {
            url: "/{bar:[^/]+}",
            resolve: {
                api: ['APIInterface' , '$stateParams', function(APIInterface, $stateParams) {
                    APIInterface.setBar($stateParams.bar);
                }],
                bar: ['api.models.bar' , '$stateParams', function(Bar, $stateParams) {
                    return Bar.get($stateParams.bar);
                }],
                foods: ['api.models.food', function(Food) {
                    Food.clear();
                    Food.reload();
                    return Food.all();
                }],
                foodsg: ['api.models.fooddetails', function(FoodDetails) {
                    FoodDetails.clear();
                    FoodDetails.reload();
                    return FoodDetails.all();
                }],
                accounts: ['api.models.account', function(Account) {
                    Account.clear();
                    Account.reload();
                    return Account.all();
                }],
                users: ['api.models.user', function(User) {
                    User.clear();
                    User.reload();
                    return User.all();
                }],
                user: ['api.models.user', 'auth.user', function(User, AuthUser) {
                    User.clear();
                    if (AuthUser.isAuthenticated()) {
                        return User.me();
                    } else {
                        return null;
                    }
                }],
                account: ['api.models.account', 'auth.user', 'user', function(Account, AuthUser, user) {
                    if (AuthUser.isAuthenticated()) {
                        return Account.ofUser(user.id);
                    } else {
                        return null;
                    }
                }],
                roles: ['api.models.role', 'auth.user', 'user', function(Role, AuthUser, user) {
                    if (AuthUser.isAuthenticated()) {
                        return Role.ofUser(user.id);
                    } else {
                        return null;
                    }
                }],
                news: ['api.models.news', function(News) {
                    News.clear();
                    News.reload();
                    return News.all();
                }]
            },
            views: {
                '@': {
                    templateUrl: "common/bar.html",
                    controller: 'main.ctrl.base'
                },
                'form@bar': {
                    templateUrl: "components/magicbar/form.html",
                    controller: 'magicbar.ctrl'
                },
                'header@bar': {
                    templateUrl: "common/header.html",
                    controller: 'main.ctrl.header'
                },
                'meal@bar': {
                    templateUrl: "components/meal/panel.html",
                    controller: 'meal.ctrl'
                },
                'user-infos@bar': {
                    templateUrl: "common/user-infos.html",
                    controller: 'main.ctrl.userInfos'
                },
                '@bar': {
                    templateUrl: "common/home.html",
                    controller: 'main.ctrl.bar'
                }
            }
        });
}])

.controller('main.ctrl.base',
    ['$scope', '$rootScope', '$stateParams', 'auth.user', 'foods', 'bar', 'accounts',
    function($scope, $rootScope, $stateParams, AuthUser, foods, bar, accounts) {
        $scope.bar = {
            id: $stateParams.bar,
            name: bar.name,
            accounts: accounts,
            search: '',
            foods: foods,
            active: 'index',
            infos: bar
        };

        $scope.user = AuthUser;
    }])

.controller(
    'main.ctrl.bar',
    ['$scope','news', 'auth.user',
    function($scope, news, AuthUser) {
        $scope.bar.active = 'index';
        $scope.list_news = function () {
            return _.sortBy(_.reject(news, 'deleted'), 'last_modified');
        };

        function dateDiff(date1, date2){
            var diff = {}                           // Initialisation du retour
            var tmp = date2 - date1;

            tmp = Math.floor(tmp/1000);             // Nombre de secondes entre les 2 dates
            diff.sec = tmp % 60;                    // Extraction du nombre de secondes

            tmp = Math.floor((tmp-diff.sec)/60);    // Nombre de minutes (partie entière)
            diff.min = tmp % 60;                    // Extraction du nombre de minutes

            tmp = Math.floor((tmp-diff.min)/60);    // Nombre d'heures (entières)
            diff.hour = tmp % 24;                   // Extraction du nombre d'heures

            tmp = Math.floor((tmp-diff.hour)/24);   // Nombre de jours restants
            diff.day = tmp;

            return diff.day;
        }
        $scope.news_recente = function(news) {
            var now = new Date();
            var newsDate = new Date(news.last_modified);
            return dateDiff(newsDate, now) <= 1;
        };

        if (AuthUser.isAuthenticated()) {
            document.getElementById("q_alim").focus();
        } else {
            document.getElementById("floginc").focus();
        }
        var now = new Date();
        var dateAppro = new Date($scope.bar.infos.next_scheduled_appro);
        $scope.thereIsAnAppro = dateAppro >= now;
    }])
.controller(
    'main.ctrl.header',
    ['$scope','auth.user',
    function($scope, AuthUser) {
        $scope.login = {
            username: '',
            password: ''
        };

        $scope.connexion = function (login) {
            $scope.loginError = false;
            $scope.inLogin = true;
            AuthUser.login(login).then(
                function(user) {
                    $scope.login = {username: '', password: ''};
                    $scope.inLogin = false;
                }, function(error) {
                    $scope.loginError = true;
                    $scope.login.password = '';
                    $scope.inLogin = false;
                }
            );
        };
    }])

.controller(
    'main.ctrl.userInfos',
    ['$scope', 'auth.user', 'api.models.account', 'api.models.user', 'api.models.role', 'bars.meal', 'user', 'account', 'roles',
    function($scope, AuthUser, Account, User, Role, Meal, user, account, roles) {
        if (account && account.length > 0) {
            account = Account.get(account[0].id);
        } else {
            account = null;
        }

        if (user) {
            AuthUser.account = account;
            AuthUser.user = user;
            AuthUser.roles = roles;
            AuthUser.computePerms();
            Meal.account = AuthUser.account;
            Meal.init();
        }

        $scope.meal = Meal;
    }])

.directive(
    'selectOnClick',
    function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on('click', function () {
                    this.select();
                });
            }
        };
    })
;
