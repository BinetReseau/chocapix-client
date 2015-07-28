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
                if (interval == 'months') {
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

            function updateData() {
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
            }
            updateData();

            $scope.$watch('futurData', updateData);
        }]
    }
})
.directive('barsStatsPanel', function() {
    return {
        restrict: 'E',
        scope: {
            model: '=model'
        },
        templateUrl: 'components/stats/panel.directive.html',
        controller: ['$scope', function($scope) {
            $scope.label = 'Quantité achetée';
            $scope.unit = $scope.model.unit_name;
            $scope.date_start = moment().subtract(7, 'days').toDate();
            $scope.date_end = moment().endOf('day').toDate();

            $scope.params = {
                interval: 'days',
                date_start: moment().subtract(7, 'days').toDate(),
                date_end: moment().endOf('day').toDate()
            };

            $scope.computeData = function() {
                var start = moment($scope.params.date_start);
                var end = moment($scope.params.date_end);
                var range = moment.range(start, end);
                if (range.diff('days') > 45) {
                    $scope.params.interval = 'months';
                } else {
                    $scope.params.interval = 'days';
                }
                $scope.data = $scope.model.stats($scope.params);
                console.log($scope.data);
            }
            $scope.computeData();

            // Utils functions for datepicker
            $scope.start_opened = false;
            $scope.end_opened = false;
            $scope.open = function($event, w) {
                $event.preventDefault();
                $event.stopPropagation();
                if (w == 'start') {
                    $scope.start_opened = true;
                } else {
                    $scope.end_opened = true;
                }
            };
        }]
    };
})
;
