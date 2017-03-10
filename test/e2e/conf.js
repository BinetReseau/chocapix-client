exports.config = {
    directConnect: true,
    // specs: ['specs/*.js'],
    capabilities: {
        'browserName': 'chrome'
    },
    suites: {
        adminUser: [
            'admin/init.js',
            'admin/account/account.spec.js',
            'admin/account/collective_payment.spec.js'
        ],
        adminFood: [
            'admin/init.js',
            'admin/food/newitem.spec.js',
            'admin/food/inventory.spec.js',
            'admin/food/appro.spec.js',
            'admin/food/newitem-interbar.spec.js',
            'food/edition.food.spec.js',
        ]

    },
    jasmineNodeOpts: {
        defaultTimeoutInterval: 60000
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
