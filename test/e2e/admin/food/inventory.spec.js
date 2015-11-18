var BarsAdminFoodInventoryPage = require('./inventory.po.js');

describe('Inventory', function() {
    var barsAdminFoodInventoryPage = new BarsAdminFoodInventoryPage();

    it('should add stockitems via the list and validate', function() {
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

    it('should add a sellitem out of stock', function() {
        barsAdminFoodInventoryPage.clickFirstItemOutOfStock();
        expect(barsAdminFoodInventoryPage.getPrice()).toEqual("-14,00 €");
        expect(barsAdminFoodInventoryPage.countItemsNotInInventory()).toBe(2);
        expect(barsAdminFoodInventoryPage.countItemsInInventory()).toBe(2);
        barsAdminFoodInventoryPage.clickValidate();
        expect(barsAdminFoodInventoryPage.getPrice()).toEqual("0,00 €");
    });

    it('should add a stockitem by barcode', function() {
        barsAdminFoodInventoryPage.enterBarcode('123');
        expect(barsAdminFoodInventoryPage.getPrice()).toEqual("0,50 €");
        expect(barsAdminFoodInventoryPage.countItemsNotInInventory()).toBe(3);
        expect(barsAdminFoodInventoryPage.countItemsInInventory()).toBe(1);
        barsAdminFoodInventoryPage.enterBarcode('123456');
        expect(barsAdminFoodInventoryPage.getPrice()).toEqual("1,10 €");
        expect(barsAdminFoodInventoryPage.countItemsNotInInventory()).toBe(2);
        expect(barsAdminFoodInventoryPage.countItemsInInventory()).toBe(2);
        barsAdminFoodInventoryPage.enterBarcode('123456');
        expect(barsAdminFoodInventoryPage.getPrice()).toEqual("1,70 €");
        expect(barsAdminFoodInventoryPage.countItemsNotInInventory()).toBe(2);
        expect(barsAdminFoodInventoryPage.countItemsInInventory()).toBe(2);
        barsAdminFoodInventoryPage.enterBarcode('123456789');
        expect(barsAdminFoodInventoryPage.getPrice()).toEqual("7,70 €");
        expect(barsAdminFoodInventoryPage.countItemsNotInInventory()).toBe(2);
        expect(barsAdminFoodInventoryPage.countItemsInInventory()).toBe(2);
    });

    it('should verify the updated stock', function() {
        // element(by.partialLinkText('Aliments')).click();
        // expect(element(by.repeater("f in food_list | filter:filterItems | orderBy:list_order:reverse | limitTo: limit.nb track by f.id").row(1)).getText()).toMatch(/Coca-Cola/);
        // expect(element(by.repeater("f in food_list | filter:filterItems | orderBy:list_order:reverse | limitTo: limit.nb track by f.id").row(1)).getText()).toMatch(/2 canettes/);
        // expect(element(by.repeater("f in food_list | filter:filterItems | orderBy:list_order:reverse | limitTo: limit.nb track by f.id").row(1)).getText()).toMatch(/0,60 € \/ canette/);
        // expect(element(by.repeater("f in food_list | filter:filterItems | orderBy:list_order:reverse | limitTo: limit.nb track by f.id").row(1)).getText()).toMatch(/1,20 €/);
    });
});
