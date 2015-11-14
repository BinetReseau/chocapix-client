exports.config = {
    directConnect: true,
    specs: ['specs/*.js'],
    capabilities: {
        'browserName': 'chrome'
    },
    onPrepare: function() {
        /* global angular: false, browser: false, jasmine: false */

        // Disable animations so e2e tests run more quickly
        var disableNgAnimate = function() {
          angular.module('disableNgAnimate', []).run(['$animate', function($animate) {
            $animate.enabled(false);
          }]);
        };

        browser.addMockModule('disableNgAnimate', disableNgAnimate);
    }
};
