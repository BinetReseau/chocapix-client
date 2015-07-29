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
            postUnits: '=postUnits',
            xLabels: '=xlabels'
        },
        link: function (scope, elem, attrs) {
            elem.addClass('morris-chart');
            var xLabels = scope.xLabels;
            scope.$watch('data', function() {
                if(scope.data) {
                    if(!scope.morris || xLabels != scope.xLabels) {
                        elem.empty();
                        xLabels = scope.xLabels;
                        scope.morris = new Morris.Line({
                            element: elem,
                            data: scope.data,
                            xkey: scope.xkey,
                            ykeys: scope.ykeys,
                            labels: scope.labels,
                            postUnits: scope.postUnits,
                            xLabels: xLabels,
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
            $scope.xlabels = intervalToXLabels($scope.interval);

            var interval;
            function intervalToXLabels(i) {
                return i.substring(0, i.length - 1);
            }
            function next(d) {
                return d.add(1, interval);
            }
            function format(d) {
                if (interval == 'years') {
                    return d.format("YYYY");
                } else if (interval == 'months') {
                    return d.format("YYYY-MM");
                }
                return d.format("YYYY-MM-DD");
            }

            function updateData() {
                interval = $scope.interval || 'days';
                $scope.xlabels = intervalToXLabels($scope.interval);
                $scope.futurData.then(function (data) {
                    $scope.data = [];
                    if (data.length == 0) {
                        return;
                    }
                    var current = moment(data[0][0]);
                    for (var i = 0; i < data.length; i++) {
                        while (current.isBefore(data[i][0])) {
                            $scope.data.push({
                                date: format(current),
                                value: 0
                            });
                            next(current);
                        }
                        $scope.data.push({
                            date: format(moment(data[i][0])),
                            value: Math.round(-data[i][1]*100)/100
                        });
                        next(current);
                    }
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
            if ($scope.model._type == "Account") {
                $scope.label = 'Somme dépensée';
            } else {
                $scope.label = 'Quantité achetée';
            }
            $scope.stat_type = 'evolution';
            $scope.unit = $scope.model.unit_name;
            $scope.date_start = moment().subtract(7, 'days').toDate();
            $scope.date_end = moment().endOf('day').toDate();

            $scope.params = {
                interval: 'days',
                date_start: $scope.date_start,
                date_end: $scope.date_end,
                type: ['buy', 'meal'],
                aggregate: false
            };

            $scope.computeData = function() {
                if ($scope.stat_type == 'evolution') {
                    var start = moment($scope.params.date_start);
                    var end = moment($scope.params.date_end);
                    var range = moment.range(start, end);
                    if (range.diff('days') > 90) {
                        $scope.params.interval = 'months';
                    } else if (range.diff('days') > 45) {
                        $scope.params.interval = 'weeks';
                    } else {
                        $scope.params.interval = 'days';
                    }
                } else {
                    $scope.params.aggregate = true;
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
