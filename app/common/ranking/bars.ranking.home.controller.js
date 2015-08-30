'use strict';

angular.module('bars.granking')
.controller('bars.granking.home.ctrl',
    ['$scope', 'api.models.bar', 'bars_list', 'best_nazis', 'best_bieres_ever', 'best_bieres_month', 'best_pizzas_ever', function($scope, Bar, bars_list, best_nazis, best_bieres_ever, best_bieres_month, best_pizzas_ever) {
        $scope.state.active = 'home';

        $scope.bars_list = bars_list;
        $scope.best_nazis = best_nazis;
        $scope.best_bieres_ever = best_bieres_ever;
        $scope.best_bieres_month = best_bieres_month;
        $scope.best_pizzas_ever = best_pizzas_ever;

        $scope.nth = function (n, ranking) {
            return Bar.get(_.sortByAll(ranking, 'val')[n-1].id).name;
        };
        $scope.total = function (ranking) {
            return _.reduce(ranking, function (total, bar) {
                return total - bar.val;
            }, 0);
        }
    }])
;
