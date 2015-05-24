'use strict';

angular.module('bars.main', [
    'bars.filters'
    ])

.config(['$stateProvider', '$urlMatcherFactoryProvider', function($stateProvider, $urlMatcherFactoryProvider) {
    $urlMatcherFactoryProvider.strictMode(false);
    $stateProvider
        .state('bar', {
            url: "/{bar:[^/]+}",
            resolve: {
                api: ['APIInterface' , '$stateParams', function(APIInterface, $stateParams) {
                    APIInterface.setBar($stateParams.bar);
                }],
                bar: ['api.models.bar', 'api.models.barsettings', '$stateParams', function(Bar, BarSettings, $stateParams) { // BarSettings necessary to register the model in APIModel
                    return Bar.get($stateParams.bar);
                }],
                itemdetails: ['api.models.itemdetails', '$rootScope', function(ItemDetails, $rootScope) {
                    ItemDetails.clear();
                    return ItemDetails.reload().then(function (o) {
                        $rootScope.$broadcast('api.ItemDetails.loaded');
                        return o;
                    });
                }],
                buyitem: ['api.models.buyitem', '$rootScope', function(BuyItem, $rootScope) {
                    BuyItem.clear();
                    return BuyItem.reload().then(function (o) {
                        $rootScope.$broadcast('api.BuyItem.loaded');
                        return o;
                    });
                }],
                buyitemprice: ['api.models.buyitemprice', '$rootScope', function(BuyItemPrice, $rootScope) {
                    BuyItemPrice.clear();
                    return BuyItemPrice.reload().then(function (o) {
                        $rootScope.$broadcast('api.BuyItemPrice.loaded');
                        return o;
                    });
                }],
                stockitem: ['api.models.stockitem', '$rootScope', function(StockItem, $rootScope) {
                    StockItem.clear();
                    return StockItem.reload().then(function (o) {
                        $rootScope.$broadcast('api.StockItem.loaded');
                        return o;
                    });
                }],
                sellitem: ['api.models.sellitem', '$rootScope', function(SellItem, $rootScope) {
                    SellItem.clear();
                    return SellItem.reload().then(function (o) {
                        $rootScope.$broadcast('api.SellItem.loaded');
                        return o;
                    });
                }],
                accounts: ['api.models.account', '$rootScope', function(Account, $rootScope) {
                    Account.clear();
                    return Account.reload().then(function (o) {
                        $rootScope.$broadcast('api.Account.loaded');
                        return o;
                    });
                }],
                users: ['api.models.user', '$rootScope', function(User, $rootScope) {
                    User.clear();
                    return User.reload().then(function (o) {
                        $rootScope.$broadcast('api.User.loaded');
                        return o;
                    }, function () {
                        $rootScope.$broadcast('api.User.error');
                        return [];
                    });
                }],
                user: ['api.models.user', 'auth.service', function(User, AuthService) {
                    if (AuthService.isAuthenticated()) {
                        return User.me();
                    } else {
                        return null;
                    }
                }],
                account: ['api.models.account', 'auth.service', 'user', function(Account, AuthService, user) {
                    if (AuthService.isAuthenticated()) {
                        return Account.ofUser(user.id);
                    } else {
                        return null;
                    }
                }],
                rolesc: ['api.models.role', 'auth.service', 'user', function(Role, AuthService, user) {
                    if (AuthService.isAuthenticated()) {
                        return Role.ofUser(user.id);
                    } else {
                        return null;
                    }
                }],
                rolesg: ['api.models.role', 'auth.service', 'user', function(Role, AuthService, user) {
                    if (AuthService.isAuthenticated()) {
                        return Role.ofUser(user.id, 'root');
                    } else {
                        return null;
                    }
                }],
                news: ['api.models.news', '$rootScope', function(News, $rootScope) {
                    News.clear();
                    return News.reload().then(function (o) {
                        $rootScope.$broadcast('api.News.loaded');
                        return o;
                    });
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
    ['$scope', '$rootScope', '$stateParams', '$modal', 'auth.user', 'sellitem', 'bar', 'accounts', '$timeout', '$state', 'api.models.user',
    function($scope, $rootScope, $stateParams, $modal, AuthUser, sellitem, bar, accounts, $timeout, $state, User) {
        $rootScope.appLoaded = true;

        $scope.bar = {
            id: $stateParams.bar,
            name: bar.name,
            accounts: accounts,
            search: '',
            sellitems: sellitem,
            active: 'index',
            infos: bar.settings
        };

        $scope.user = AuthUser;
        $scope.user_authenticated = function() {
            return AuthUser.isAuthenticated();
        };

        $rootScope.$on('auth.hasLoggedIn', function () {
            if (User.all().length == 0 || User.all()[0].lastname === undefined || User.all()[User.all().length-1].lastname === undefined) {
                User.reload();
            }
        });
        $rootScope.$on('auth.hasLoggedOut', function () {
            _.forEach(SellItem.all(), function (si) {
                si.urank = 0;
            });
        });

        $scope.signalBug = function() {
            var modalBug = $modal.open({
                templateUrl: 'common/modal-bug.html',
                controller: ['$scope', '$modalInstance', 'api.models.bug', '$filter', function ($scope, $modalInstance, Bug, $filter) {
                    $scope.bugSignaled = false;
                    $scope.bug = Bug.create();
                    $scope.submitBug = function() {
                        var bugData = {params: $state.params};
                        bugData.currentState = $state.current.name;
                        $scope.bug.data = $filter('json')(bugData);
                        console.log($scope.bug.data);
                        $scope.bug.$save().then(function() {
                            $scope.bugSignaled = true;
                            $timeout(function() {
                                $modalInstance.close();
                                return true;
                            }, 1000);
                        });
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }],
                size: 'lg'
            });
        };
    }])

.controller(
    'main.ctrl.bar',
    ['$scope','news', 'auth.user', '$timeout',
    function($scope, news, AuthUser, $timeout) {
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
            return dateDiff(newsDate, now) == 0;
        };

        if (AuthUser.isAuthenticated()) {
            document.getElementById("q_alim").focus();
        } else {
            document.getElementById("floginc").focus();
        }
        var now = new Date();
        var dateAppro = new Date($scope.bar.infos.next_scheduled_appro);
        $scope.thereIsAnAppro = dateAppro >= now;

        $timeout(function() {
            var $div = $('#lnews');
            $div.on('mousewheel DOMMouseScroll', function(e) {
                var d = e.originalEvent.wheelDelta || -e.originalEvent.detail,
                    dir = d > 0 ? 'up' : 'down',
                    stop = (dir == 'up' && this.scrollTop == 0) || (dir == 'down' && this.scrollTop == this.scrollHeight-this.offsetHeight);
                stop && e.preventDefault();
            });
        }, 500);
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
    ['$scope', 'auth.user', 'api.models.account', 'api.models.user', 'api.models.role', 'bars.meal', 'user', 'account', 'rolesc', 'rolesg',
    function($scope, AuthUser, Account, User, Role, Meal, user, account, rolesc, rolesg) {
        if (account && account.length > 0) {
            account = Account.get(account[0].id);
        } else {
            account = null;
        }

        if (user) {
            AuthUser.account = account;
            AuthUser.user = user;
            if (Array.isArray(rolesc) && Array.isArray(rolesg)) {
                AuthUser.roles = rolesc.concat(rolesg);
                AuthUser.computePerms();
            }
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
.directive('compile', ['$compile', function ($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
                // watch the 'compile' expression for changes
                return scope.$eval(attrs.compile);
            },
            function(value) {
                // when the 'compile' expression changes
                // assign it into the current DOM
                element.html(value);

                // compile the new DOM and link it to the current
                // scope.
                // NOTE: we only compile .childNodes so that
                // we don't get into infinite loop compiling ourselves
                $compile(element.contents())(scope);
            }
        );
    };
}])
;
