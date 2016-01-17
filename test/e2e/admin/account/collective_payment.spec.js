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
        cP.toggleCheckByNumber(1);

        for (i = 2; i < cP.getNumberOfRows(); i++) {
            expect(cP.getCheckByNumber(i).isSelected()).toBeTruthy();
            expect(cP.getPayPreviewByNumber(i)).toMatch(/60,00 €/);
        };

        cP.setRatio(2, 5);
        cP.setRatio(3, 4);

        expect(cP.getPayPreviewByNumber(2)).toMatch(/125,00 €/);
        expect(cP.getPayPreviewByNumber(3)).toMatch(/100,00 €/);

        cP.setAmount(250);

        expect(cP.getPayPreviewByNumber(2)).toMatch(/104,17 €/);
        expect(cP.getPayPreviewByNumber(3)).toMatch(/83,33 €/);
        expect(cP.getPayPreviewByNumber(4)).toMatch(/20,83 €/);
        expect(cP.getPayPreviewByNumber(5)).toMatch(/20,83 €/);
        expect(cP.getPayPreviewByNumber(6)).toMatch(/20,83 €/);

        cP.validatePayment();

        expect(cP.getSoldeByNumber(0)).toMatch(/0,00 €/);
        expect(cP.getSoldeByNumber(1)).toMatch(/-2,00 €/);
        expect(cP.getSoldeByNumber(2)).toMatch(/2 395,83 €/);
        expect(cP.getSoldeByNumber(3)).toMatch(/-38,33 €/);
        expect(cP.getSoldeByNumber(4)).toMatch(/19,17 €/);
        expect(cP.getSoldeByNumber(5)).toMatch(/-20,83 €/);
        expect(cP.getSoldeByNumber(6)).toMatch(/-20,83 €/);

    });
});
