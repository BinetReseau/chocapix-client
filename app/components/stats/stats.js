'use strict';

angular.module('bars.stats', [
    ])
.directive('barsGraph', function() {
    return {
        restrict: 'A',
        scope: {
            data: '=data',
            xkey: '=xkey',
            ykeys: '=ykeys',
            labels: '=labels',
            postUnits: '=postUnits'
        },
        link: function (scope, elem, attrs) {
            elem.addClass('morris-chart');
            scope.$watch('data', function() {
                if(scope.data) {
                    if(!scope.morris) {
                        scope.morris = new Morris.Line({
                            element: elem,
                            data: scope.data,
                            xkey: scope.xkey,
                            ykeys: scope.ykeys,
                            labels: scope.labels,
                            postUnits: scope.postUnits,
                            smooth: false
                        });
                    } else {
                        scope.morris.setData(scope.data);
                    }
                }
            })
        }
    }
})
.directive('barsStatsGraph', function() {
    return {
        restrict: 'E',
        scope: {
            futurData: '=futurData',
            interval: '=interval',
            label: '=label',
            unit: '=unit'
        },
        templateUrl: 'components/stats/graph.directive.html',
        controller: ['$scope', function($scope) {
            $scope.data = [];
            $scope.xkey = 'date';
            $scope.ykeys = ['value'];
            $scope.labels = [$scope.label];
            $scope.postUnits = " " + $scope.unit;

            var interval = $scope.interval || 'days';

            function next(d) {
                if (interval == 'mounths') {
                    return d.setMonth(d.getMonth() + 1);
                } else if (interval == 'days') {
                    return d.setDate(d.getDate() + 1);
                }
            }
            function format(d) {
                d = new Date(d);
                var out = d.getFullYear();
                if (interval == 'years') {
                    return out;
                }
                out += '-' + d.getMonth();
                if (interval == 'months') {
                    return out;
                }
                out += '-' + d.getDate();
                return out;
            }

            $scope.futurData.then(function (data) {
                $scope.data = [];
                var current = new Date(data[0][0]);
                for (var i = 0; i < data.length; i++) {
                    while (current < new Date(data[i][0])) {
                        console.log(current, new Date(data[i][0]));
                        $scope.data.push({
                            date: format(current),
                            value: 0
                        });
                        next(current);
                    }
                    $scope.data.push({
                        date: format(data[i][0]),
                        value: Math.round(-data[i][1]*100)/100
                    });
                    next(current);
                }
                console.log($scope.data);
            });
        }]
    }
})
;
