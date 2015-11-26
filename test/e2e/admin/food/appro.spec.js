var BarsAdminFoodApproPage = require('./appro.po.js');

describe('Appro', function() {
    var barsAdminFoodApproPage = new BarsAdminFoodApproPage();

    it('should add an item by name', function() {
        // Appro de l'aliment
        // element(by.id('admin-food')).click();
        // element(by.linkText('Faire une appro')).click();
        //
        // expect(element(by.binding("appro.totalPrice | currency")).getText()).toEqual("0,00 €");
        //
        // element(by.model('appro.itemToAdd')).sendKeys('123').sendKeys(protractor.Key.TAB);
        //
        // expect(element(by.repeater("(i, item) in appro.itemsList | orderBy:'nb':true | filter:filterItemsl").row(0)).getText()).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        // expect(element(by.binding("appro.totalPrice | currency")).getText()).toEqual("0,50 €");
        //
        // element(by.buttonText("Valider l'appro")).click();
        //
        // expect(element(by.binding("appro.totalPrice | currency")).getText()).toEqual("0,00 €");
    });
});
