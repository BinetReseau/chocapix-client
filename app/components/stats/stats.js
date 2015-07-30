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
            xLabels: '=xlabels',
            dateFormat: '&dateFormat',
            xlabelformat: '&xlabelformat',
            parseTime: '=parseTime'
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
                            smooth: false,
                            parseTime: scope.parseTime,
                            dateFormat: function (x) {
                                if (scope.parseTime) {
                                    return scope.dateFormat({x: x});
                                }
                                return scope.dateFormat({x: x.label});
                            },
                            xLabelFormat: function (x) {
                                if (scope.parseTime) {
                                    return scope.xlabelformat({x: x});
                                }
                                return scope.xlabelformat({x: x.label});
                            }
                        });
                    } else {
                        scope.morris.setData(scope.data);
                    }
                }
            });
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
            var history = true;

            var dict_days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
            var dict_months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"];

            function intervalToXLabels(i) {
                if (i == 'hours' || i == 'days' || i == 'weeks' || i == 'months' || i == 'years') {
                    return i.substring(0, i.length - 1);
                } else {
                    if (i == 'hours_of_day') {
                        return 'hour';
                    } else if (i == 'days_of_week') {
                        return 'day';
                    } else {
                        return 'month';
                    }
                }
            }
            function next(d) {
                return d.add(1, interval);
            }
            function format(d) {
                if (interval == 'years') {
                    return d.format("YYYY");
                } else if (interval == 'months') {
                    return d.format("YYYY-MM");
                } else if (interval == 'days') {
                    return d.format("YYYY-MM-DD");
                } else {
                    return d.format("YYYY-MM-DD HH:mm");
                }
            }

            function updateData() {
                interval = $scope.interval || 'days';
                history = (interval.indexOf('_of_') == -1);

                $scope.xlabels = intervalToXLabels($scope.interval);
                $scope.parseTime = history;

                $scope.futurData.then(function (data) {
                    $scope.data = [];
                    if (data.length == 0) {
                        return;
                    }
                    data = _.sortBy(data, function (a) {
                        if (history) {
                            return a[0];
                        } else {
                            return parseInt(a[0]);
                        }
                    });

                    // Évolution
                    if (history) {
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
                    } else { // Moyenne
                        var currentEnd, current;
                        if (interval == 'hours_of_day') {
                            current = 0;
                            currentEnd = 23;
                        } else if (interval == 'days_of_week') {
                            current = 0;
                            currentEnd = 6;
                        } else {
                            current = parseInt(data[0][0]);
                            currentEnd = parseInt(data[data.length-1][0]);
                        }

                        for (var i = 0; i < data.length; i++) {
                            for (;current < data[i][0]; current++) {
                                $scope.data.push({
                                    date: current,
                                    value: 0
                                });
                            }
                            $scope.data.push({
                                date: parseInt(data[i][0]),
                                value: Math.round(-data[i][1]*100)/100
                            });
                            current++;
                        }
                        for (;current <= currentEnd; current++) {
                            $scope.data.push({
                                date: current,
                                value: 0
                            });
                        }
                    }
                });

                if (history) {
                    if (interval == "hours") {
                        $scope.dateFormat = function(x) { return moment(x).format('DD/MM/YYYY HH:mm'); };
                        $scope.xlabelformat = function (x) { return moment(x).format('HH:mm'); };
                    } else if (interval == "months") {
                        $scope.dateFormat = function(x) { return moment(x).format("MMMM YYYY"); };
                        $scope.xlabelformat = function (x) { return moment(x).format("MMM YYYY"); };
                    } else if (interval == "weeks") {
                        $scope.dateFormat = function(x) { return moment(x).format("DD/MM/YYYY") + ' → ' + moment(x).add(1, 'week').format("DD/MM/YYYY"); };
                        $scope.xlabelformat = function (x) { return moment(x).format('DD/MM/YYYY'); };
                    } else {
                        $scope.dateFormat = function(x) { return moment(x).format('dddd DD MMMM YYYY'); };
                        $scope.xlabelformat = function (x) { return moment(x).format('DD/MM/YYYY'); };
                    }
                } else {
                    var fnp;
                    if (interval == "hours_of_day") {
                        fnp = function(x) { return x + "h"; };
                    } else if (interval == "days_of_week") {
                        fnp = function(x) { return dict_days[x]; };
                    } else {
                        fnp = function(x) {return dict_months[x]; };
                    }
                    $scope.dateFormat = fnp;
                    $scope.xlabelformat = fnp;
                }
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
                $scope.unit = '€';
            } else {
                $scope.label = 'Quantité achetée';
                $scope.unit = $scope.model.unit_name_plural;
            }
            $scope.stat_type = 'evolution';
            $scope.date_start = moment().subtract(7, 'days').toDate();
            $scope.date_end = moment().endOf('day').toDate();

            $scope.params = {
                interval: 'days',
                date_start: $scope.date_start,
                date_end: $scope.date_end,
                type: ['buy', 'meal']
            };

            $scope.computeData = function() {
                if ($scope.stat_type == 'evolution') {
                    var start = moment($scope.params.date_start);
                    var end = moment($scope.params.date_end);
                    var range = moment.range(start, end);
                    if (range.diff('days') > 120) {
                        $scope.params.interval = 'months';
                    } else if (range.diff('days') > 60) {
                        $scope.params.interval = 'weeks';
                    } else if (range.diff('days') > 2) {
                        $scope.params.interval = 'days';
                    } else {
                        $scope.params.interval = 'hours';
                    }
                }
                $scope.data = $scope.model.stats($scope.params);
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
