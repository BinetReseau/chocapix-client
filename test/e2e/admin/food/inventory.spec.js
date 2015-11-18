var BarsAdminFoodInventoryPage = require('./inventory.po.js');

describe('Inventory', function() {
    var barsAdminFoodInventoryPage = new BarsAdminFoodInventoryPage();

    it('should add a stockitem via the list', function() {
        barsAdminFoodInventoryPage.go();

        element(by.linkText('Coca-Cola')).click();
        element(by.linkText('Canette de 33 cl de Coca-Cola')).click();


        expect(barsAdminFoodInventoryPage.getPrice()).toEqual("0,50 €");
        barsAdminFoodInventoryPage.changeLastItemQty("0");
        expect(barsAdminFoodInventoryPage.getPrice()).toEqual("5,00 €");
        // browser.pause();
        element(by.linkText('Canette de 33 cl de Coca-Cola Light')).click();
        expect(barsAdminFoodInventoryPage.getPrice()).toEqual("5,60 €");
        barsAdminFoodInventoryPage.changeLastItemQty("5");
        expect(barsAdminFoodInventoryPage.getPrice()).toEqual("14,00 €");

        barsAdminFoodInventoryPage.clickValidate();
        expect(barsAdminFoodInventoryPage.getPrice()).toEqual("0,00 €");
    });

    it('should verify the updated stock', function() {
        // element(by.partialLinkText('Aliments')).click();
        // expect(element(by.repeater("f in food_list | filter:filterItems | orderBy:list_order:reverse | limitTo: limit.nb track by f.id").row(1)).getText()).toMatch(/Coca-Cola/);
        // expect(element(by.repeater("f in food_list | filter:filterItems | orderBy:list_order:reverse | limitTo: limit.nb track by f.id").row(1)).getText()).toMatch(/2 canettes/);
        // expect(element(by.repeater("f in food_list | filter:filterItems | orderBy:list_order:reverse | limitTo: limit.nb track by f.id").row(1)).getText()).toMatch(/0,60 € \/ canette/);
        // expect(element(by.repeater("f in food_list | filter:filterItems | orderBy:list_order:reverse | limitTo: limit.nb track by f.id").row(1)).getText()).toMatch(/1,20 €/);
    });
});
