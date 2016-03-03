var AdminFoodInventory = require('./inventory.po.js');
var FoodList = require('../../food/list.food.po.js');

describe('Inventory', function() {
    var AFI = new AdminFoodInventory();
    var FL = new FoodList();

    it('should add stockitems via the list and validate', function() {
        AFI.go();

        element(by.linkText('Coca-Cola')).click();
        element(by.linkText('Canette de 33 cl de Coca-Cola')).click();

        expect(AFI.getPrice()).toEqual("0,50 €");
        AFI.changeLastItemQty("0"); // Comme de base il y a 1 dans le champ, là on rajoute simplement un 0 ce qui fait donc 10
        expect(AFI.getPrice()).toEqual("5,00 €");

        element(by.linkText('Canette de 33 cl de Coca-Cola Light')).click();
        expect(AFI.getPrice()).toEqual("5,60 €");
        AFI.changeLastItemQty("5"); // Là la quantité passe à 15
        expect(AFI.getPrice()).toEqual("14,00 €");

        AFI.clickValidate();
        expect(AFI.getPrice()).toEqual("0,00 €");
    });

    it('should verify the updated stock', function() {
        FL.go();
        expect(FL.getRowText(0)).toMatch(/Coca-Cola/);
        expect(FL.getRowText(0)).toMatch(/25 canettes/);
        expect(FL.getRowText(0)).toMatch(/0,67 € \/ canette/);
        expect(FL.getRowText(0)).toMatch(/16,80 €/);

        FL.toggleRow(0);

        expect(FL.getSubRowText(0, 1)).toMatch(/Canette de 33 cl de Coca-Cola/);
        expect(FL.getSubRowText(0, 1)).not.toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(FL.getSubRowText(0, 1)).toMatch(/10 canettes/);
        expect(FL.getSubRowText(0, 1)).toMatch(/0,60 € \/ canette/);
        expect(FL.getSubRowText(0, 1)).toMatch(/6,00 €/);

        expect(FL.getSubRowText(0, 2)).toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(FL.getSubRowText(0, 2)).toMatch(/15 canettes/);
        expect(FL.getSubRowText(0, 2)).toMatch(/0,72 € \/ canette/);
        expect(FL.getSubRowText(0, 2)).toMatch(/10,80 €/);

        FL.toggleRow(0);
    });

    it('should add a sellitem out of stock', function() {
        AFI.go();

        AFI.clickFirstItemOutOfStock();
        expect(AFI.getPrice()).toEqual("-14,00 €");

        expect(AFI.countItemsNotInInventory()).toBe(1);
        expect(AFI.countItemsInInventory()).toBe(2);
        AFI.clickValidate();
        expect(AFI.getPrice()).toEqual("0,00 €");
    });

    it('should add a stockitem by barcode', function() {
        AFI.enterBarcode('123');
        expect(AFI.getPrice()).toEqual("0,50 €");
        expect(AFI.countItemsNotInInventory()).toBe(2);
        expect(AFI.countItemsInInventory()).toBe(1);
        AFI.enterBarcode('123456');
        expect(AFI.getPrice()).toEqual("1,10 €");
        expect(AFI.countItemsNotInInventory()).toBe(1);
        expect(AFI.countItemsInInventory()).toBe(2);
        AFI.enterBarcode('123456');
        expect(AFI.getPrice()).toEqual("1,70 €");
        expect(AFI.countItemsNotInInventory()).toBe(1);
        expect(AFI.countItemsInInventory()).toBe(2);
        AFI.enterBarcode('123456789');
        expect(AFI.getPrice()).toEqual("7,70 €");
        expect(AFI.countItemsNotInInventory()).toBe(1);
        expect(AFI.countItemsInInventory()).toBe(2);
    });

    it('should remove a stockitem from the inventory', function() {
        AFI.removeLastItem();
        expect(AFI.countItemsNotInInventory()).toBe(2);
        expect(AFI.countItemsInInventory()).toBe(1);
        expect(AFI.getPrice()).toEqual("0,50 €");
        AFI.removeLastItem();
        expect(AFI.countItemsNotInInventory()).toBe(2);
        expect(AFI.countItemsInInventory()).toBe(0);
        expect(AFI.getPrice()).toEqual("0,00 €");
    });

    it('should verify the empty stock', function() {
        FL.go();
        expect(FL.getRowText(0)).toMatch(/Coca-Cola/);
        expect(FL.getRowText(0)).toMatch(/0 canette/);
        expect(FL.getRowText(0)).toMatch(/0,66 € \/ canette/);
        expect(FL.getRowText(0)).toMatch(/0,00 €/);

        FL.toggleRow(0);

        expect(FL.getSubRowText(0, 1)).toMatch(/Canette de 33 cl de Coca-Cola/);
        expect(FL.getSubRowText(0, 1)).not.toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(FL.getSubRowText(0, 1)).toMatch(/0 canette/);
        expect(FL.getSubRowText(0, 1)).toMatch(/0,60 € \/ canette/);
        expect(FL.getSubRowText(0, 1)).toMatch(/0,00 €/);

        expect(FL.getSubRowText(0, 2)).toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(FL.getSubRowText(0, 2)).toMatch(/0 canette/);
        expect(FL.getSubRowText(0, 2)).toMatch(/0,72 € \/ canette/);
        expect(FL.getSubRowText(0, 2)).toMatch(/0,00 €/);

        FL.toggleRow(0);
    });
});
