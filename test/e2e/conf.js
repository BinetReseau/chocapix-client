exports.config = {
    directConnect: true,
    // specs: ['specs/*.js'],
    capabilities: {
        'browserName': 'chrome'
    },
    suites: {
        admin: [
            'admin/init.js',
            'admin/food/newitem.spec.js',
            'admin/food/inventory.spec.js',
            'admin/food/appro.spec.js'
        ]
    },
    onPrepare: function() {
        // Disable animations so the splashscreen disappear...
        var disableNgAnimate = function() {
          angular.module('disableNgAnimate', []).run(['$animate', function($animate) {
            $animate.enabled(false);
          }]);
        };

        browser.addMockModule('disableNgAnimate', disableNgAnimate);
    }
};
