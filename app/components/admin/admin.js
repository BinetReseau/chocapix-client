'use strict';

angular.module('bars.admin', [

    ])

.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('bar.admin', {
            url: "/admin",
            views: {
                '@bar': {
                    templateUrl: "components/admin/layout.html",
                    controller: 'admin.ctrl.base'
                },
                '@bar.admin': {
                    templateUrl: "components/admin/dashboard.html",
                    controller: 'admin.ctrl.home',
                    resolve: {
                        account_list: ['api.models.account', function(Account) {
                            return Account.all();
                        }],
                        food_list: ['api.models.food', function(Food) {
                            return Food.all();
                        }]
                    }
                }
            }
        })
        // Admin food
        .state('bar.admin.food', {
            abstract: true,
            url: "/food",
            template: '<ui-view />'
        })
            .state('bar.admin.food.add', {
                url: "/add",
                templateUrl: "components/admin/food/add.html",
                controller: 'admin.ctrl.food.add'
            })
            .state('bar.admin.food.appro', {
                url: "/appro",
                templateUrl: "components/admin/food/appro.html",
                controller: 'admin.ctrl.food.appro'
            })
            .state('bar.admin.food.inventory', {
                url: "/inventory",
                templateUrl: "components/admin/food/inventory.html",
                controller: 'admin.ctrl.food.inventory'
            })
            .state('bar.admin.food.graphs', {
                url: "/graphs",
                templateUrl: "components/admin/food/graphs.html",
                controller: 'admin.ctrl.food.graphs'
            })
        // Admin account
        .state('bar.admin.account', {
            url: "/account",
            templateUrl: "components/admin/account/home.html",
            controller: 'admin.ctrl.account'
        })
        // Admin news
        .state('bar.admin.news', {
            abstract: true,
            url: "/news",
            template: '<ui-view />'
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

.controller('admin.ctrl.base',
    ['$scope',
    function($scope) {
        $scope.bar.active = 'admin';
        $scope.admin = {
            active: ''
        };
    }
])
.controller('admin.ctrl.home',
    ['$scope', 'account_list', 'food_list',
    function($scope, account_list, food_list) {
        $scope.admin.active = 'dashboard';
        new Morris.Line({
            // ID of the element in which to draw the chart.
            element: 'graph1',
            // Chart data records -- each entry in this array corresponds to a point on
            // the chart.
            data: [
            { year: '2008', value: 20 },
            { year: '2009', value: 10 },
            { year: '2010', value: 5 },
            { year: '2011', value: 5 },
            { year: '2012', value: 20 }
            ],
            // The name of the data record attribute that contains x-values.
            xkey: 'year',
            // A list of names of data record attributes that contain y-values.
            ykeys: ['value'],
            // Labels for the ykeys -- will be displayed when you hover over the
            // chart.
            labels: ['Value'],
            smooth: false
        });

        $scope.nbAccountNegativ = _.filter(account_list, function (o) {
            return o.money <= 0;
        }).length;
        $scope.ratioAccountNegativ = $scope.nbAccountNegativ/account_list.length;

        $scope.nbFoodNegativ = _.filter(food_list, function (o) {
            return o.qty <= 0;
        }).length;
        $scope.ratioFoodNegativ = $scope.nbFoodNegativ/food_list.length;
    }
])
// Admin food
.controller('admin.ctrl.food.add',
    ['$scope', 'api.models.food',
    function($scope, Food) {
        $scope.admin.active = 'food';
        $scope.food = Food.create();
        $scope.addFood = function() {
            $scope.food.buy_unit_value = 1;
            $scope.food.qty = $scope.food.qty/$scope.food.unit_value;
            $scope.food.unit_value = 1/$scope.food.unit_value;
            $scope.food.bar = 'avironjone'; // [TODO]Adapter bars-django
            $scope.food.$save().then(function(newFood) {
                $scope.food = Food.create();
            }, function(errors) {
                // TODO: display form errors
            });
        };
    }
])
.controller('admin.ctrl.food.appro',
    ['$scope', 'api.models.food', 'admin.appro',
    function($scope, Food, Appro) {
        $scope.admin.active = 'food';

        $scope.appro = Appro;
    }
])
.controller('admin.ctrl.food.inventory',
    ['$scope', 'api.models.food', 'admin.inventory',
    function($scope, Food, Inventory) {
        $scope.admin.active = 'food';

        $scope.inventory = Inventory;
    }
])
.controller('admin.ctrl.food.graphs',
    ['$scope', 'api.models.food',
    function($scope, Food) {
        $scope.admin.active = 'food;'
    }
])
// Admin account
.controller('admin.ctrl.account',
    ['$scope', 'api.models.account', 'api.models.user',
    function($scope, Account, User) {
        $scope.admin.active = 'account';
    }
])
// Admin news
.controller('admin.ctrl.news.add',
    ['$scope', 'api.models.news', 'api.models.user', '$state', 
    function($scope, News, User, $state) {
        $scope.formType = 'add';
        $scope.admin.active = 'news';
        $scope.news = News.create();
        $scope.saveNews = function() {
            $scope.news.name = $scope.news.name == '' ? 'Informations' : $scope.news.name;
            $scope.news.deleted = false;
            $scope.news.author = 5; // [TODO]Adapter bars-django... ou pas
            $scope.news.bar = 'avironjone'; // [TODO]Adapter bars-django
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
            news.$save().then(function() {
                News.reload();
                $scope.news_list = News.all();
            });
        };
        $scope.untrash = function(news) {
            news.deleted = false;
            news.$save().then(function() {
                News.reload();
                $scope.news_list = News.all();
            });
        };
        $scope.upNews = function(news) {
            news.$save().then(function() {
                News.reload();
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
            $scope.news.author = 5; // [TODO]Adapter bars-django... ou pas
            $scope.news.bar = 'avironjone'; // [TODO]Adapter bars-django
            $scope.news.$save().then(function(newNews) {
                $state.go('bar.admin.news.list');
            }, function(errors) {
                // TODO: display form errors
            });
        };
    }
])
.factory('admin.appro',
    ['api.models.food', 'api.services.action',
    function (Food, APIAction) {
        return {
            itemsList: [],
            totalPrice: 0,
            inRequest: false,
            itemToAdd: "",
            init: function() {
                this.itemsList = [];
                this.totalPrice = 0;
                this.inRequest = false;
            },
            recomputeAmount: function() {
                var nbItems = this.itemsList.length;

                var totalPrice = 0;
                _.forEach(this.itemsList, function(item, i) {
                    // totalPrice += item.item.price * item.qty * item.unit_value;
                    if (item.qty && item.qty > 0 && item.price && item.unit_value) {
                        item.price = item.price * item.qty * item.unit_value/(item.old_qty * item.old_unit_value);
                        item.old_qty = item.qty;
                        item.old_unit_value = item.unit_value;
                    }
                    totalPrice += item.price;
                });

                this.totalPrice = totalPrice;
            },
            addItem: function(item, qty) {
                if (!qty) {
                    qty = item.buy_unit_value;
                }
                var other = _.find(this.itemsList, {'item': item});
                if (other) {
                    other.qty += qty/item.buy_unit_value;
                } else {
                    this.itemsList.push({
                        item: item,
                        qty: qty/item.buy_unit_value,
                        old_qty: qty/item.buy_unit_value,
                        unit_value: item.buy_unit_value,
                        old_unit_value: item.buy_unit_value,
                        price: item.buy_price * qty * item.buy_unit_value});
                }
                this.recomputeAmount();
                this.itemToAdd = "";
            },
            removeItem: function(item) {
                this.itemsList.splice(this.itemsList.indexOf(item), 1);
                this.recomputeAmount();
            },
            validate: function() {
                this.inRequest = true;
                _.forEach(this.itemsList, function(item, i) {
                    item.qty = item.qty * item.unit_value;
                });
                var refThis = this;
                APIAction.appro({
                    items: this.itemsList
                })
                .then(function() {
                    refThis.init();
                });
            },
            in: function() {
                return this.itemsList.length > 0;
            }
        };
    }]
)
.factory('admin.inventory',
['api.models.food', 'api.services.action',
function (Food, APIAction) {
    return {
        itemsList: [],
        inRequest: false,
        itemToAdd: "",
        init: function() {
            this.itemsList = [];
            this.inRequest = false;
        },
        addItem: function(item, qty) {
            if (!qty) {
                qty = item.unit_value;
            }
            var other = _.find(this.itemsList, {'item': item});
            if (other) {
                other.qty += qty/item.unit_value;
            } else {
                this.itemsList.push({ item: item, qty: qty/item.unit_value, unit_value: item.buy_unit_value });
            }
            this.itemToAdd = "";
        },
        removeItem: function(item) {
            this.itemsList.splice(this.itemsList.indexOf(item), 1);
        },
        validate: function() {
            this.inRequest = true;
            _.forEach(this.itemsList, function(item, i) {
                item.qty = item.qty * item.unit_value;
            });
            var refThis = this;
            APIAction.inventory({
                items: this.itemsList
            })
            .then(function() {
                refThis.init();
            });
        },
        in: function() {
            return this.itemsList.length > 0;
        }
    };
}]
)
;
