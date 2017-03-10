var CollectivePayment = require('./collective_payment.po.js');

describe('CollectivePayment', function() {
    var cP = new CollectivePayment();

    it('should proceed to a collective payment without errors', function() {
        cP.go();

        expect(cP.getValidateBTNClass()).toMatch(/disabled/);

        cP.setAmount(300);
        expect(cP.getValidateBTNClass()).toMatch(/disabled/);
        cP.setMotive('Test');
        expect(cP.getValidateBTNClass()).not.toMatch(/disabled/);

        for (i = 0; i < cP.getNumberOfRows(); i++) {
            expect(cP.getCheckByNumber(i).isSelected()).toBeTruthy();
            expect(cP.getPayPreviewByNumber(i)).toMatch(/42,86 €/);
        };

        cP.toggleCheckByNumber(0);

        for (i = 1; i < cP.getNumberOfRows(); i++) {
            expect(cP.getCheckByNumber(i).isSelected()).toBeTruthy();
            expect(cP.getPayPreviewByNumber(i)).toMatch(/150,00 €/);
        };

        cP.setRatio(1, 6);
        cP.setRatio(2, 4);

        expect(cP.getPayPreviewByNumber(1)).toMatch(/180,00 €/);
        expect(cP.getPayPreviewByNumber(2)).toMatch(/120,00 €/);

        cP.setAmount(250);

        expect(cP.getPayPreviewByNumber(1)).toMatch(/150,00 €/);
        expect(cP.getPayPreviewByNumber(2)).toMatch(/100,00 €/);

        cP.validatePayment();

        expect(cP.getSoldeByNumber(0)).toMatch(/2 500,00 €/);
        expect(cP.getSoldeByNumber(1)).toMatch(/-105,00 €/);
        expect(cP.getSoldeByNumber(2)).toMatch(/-60,00 €/);

    });
});
