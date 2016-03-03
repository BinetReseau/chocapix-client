var CollectivePayment = require('./collective_payment.po.js');

describe('CollectivePayment', function() {
    var CP = new CollectivePayment();

    it('should proceed to a collective payment without errors', function() {
        CP.go();

        expect(CP.getValidateBTNClass()).toMatch(/disabled/);

        CP.setAmount(300);
        expect(CP.getValidateBTNClass()).toMatch(/disabled/);
        CP.setMotive('Test');
        expect(CP.getValidateBTNClass()).not.toMatch(/disabled/);

        for (i = 0; i < CP.getNumberOfRows(); i++) {
            expect(CP.getCheckByNumber(i).isSelected()).toBeTruthy();
            expect(CP.getPayPreviewByNumber(i)).toMatch(/42,86 €/);
        };

        CP.toggleCheckByNumber(0);

        for (i = 1; i < CP.getNumberOfRows(); i++) {
            expect(CP.getCheckByNumber(i).isSelected()).toBeTruthy();
            expect(CP.getPayPreviewByNumber(i)).toMatch(/150,00 €/);
        };

        CP.setRatio(1, 6);
        CP.setRatio(2, 4);

        expect(CP.getPayPreviewByNumber(1)).toMatch(/180,00 €/);
        expect(CP.getPayPreviewByNumber(2)).toMatch(/120,00 €/);

        CP.setAmount(250);

        expect(CP.getPayPreviewByNumber(1)).toMatch(/150,00 €/);
        expect(CP.getPayPreviewByNumber(2)).toMatch(/100,00 €/);

        CP.validatePayment();

        expect(CP.getSoldeByNumber(0)).toMatch(/2 500,00 €/);
        expect(CP.getSoldeByNumber(1)).toMatch(/-105,00 €/);
        expect(CP.getSoldeByNumber(2)).toMatch(/-60,00 €/);

    });
});
