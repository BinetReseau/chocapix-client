var BarsBarPage = require('../bar/bar.po.js');
describe('Admin init', function() {
    it('Should connect in admin', function() {
        var barsBarPage = new BarsBarPage();

        barsBarPage.loadHomePage('avironjone');
        barsBarPage.loginAsRespoBar();
    });
});
