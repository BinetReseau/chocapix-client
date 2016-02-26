var AdminFoodInventory = require('./inventory.po.js');
var FoodList = require('../../food/list.food.po.js');

describe('Inventory', function() {
    var aFI = new AdminFoodInventory();
    var fL = new FoodList();

    it('should add stockitems via the list and validate', function() {
        aFI.go();

        element(by.linkText('Coca-Cola')).click();
        element(by.linkText('Canette de 33 cl de Coca-Cola')).click();

        expect(aFI.getPrice()).toEqual("0,50 €");
        aFI.changeLastItemQty("0"); // Comme de base il y a 1 dans le champ, là on rajoute simplement un 0 ce qui fait donc 10
        expect(aFI.getPrice()).toEqual("5,00 €");

        element(by.linkText('Canette de 33 cl de Coca-Cola Light')).click();
        expect(aFI.getPrice()).toEqual("5,60 €");
        aFI.changeLastItemQty("5"); // Là la quantité passe à 15
        expect(aFI.getPrice()).toEqual("14,00 €");

        aFI.clickValidate();
        expect(aFI.getPrice()).toEqual("0,00 €");
    });

    it('should verify the updated stock', function() {
        fL.go();
        expect(fL.getRowText(0)).toMatch(/Coca-Cola/);
        expect(fL.getRowText(0)).toMatch(/25 canettes/);
        expect(fL.getRowText(0)).toMatch(/0,67 € \/ canette/);
        expect(fL.getRowText(0)).toMatch(/16,80 €/);

        fL.toggleRow(0);

        expect(fL.getSubRowText(0, 1)).toMatch(/Canette de 33 cl de Coca-Cola/);
        expect(fL.getSubRowText(0, 1)).not.toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(fL.getSubRowText(0, 1)).toMatch(/10 canettes/);
        expect(fL.getSubRowText(0, 1)).toMatch(/0,60 € \/ canette/);
        expect(fL.getSubRowText(0, 1)).toMatch(/6,00 €/);

        expect(fL.getSubRowText(0, 2)).toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(fL.getSubRowText(0, 2)).toMatch(/15 canettes/);
        expect(fL.getSubRowText(0, 2)).toMatch(/0,72 € \/ canette/);
        expect(fL.getSubRowText(0, 2)).toMatch(/10,80 €/);

        fL.toggleRow(0);
    });

    it('should add a sellitem out of stock', function() {
        aFI.go();

        aFI.clickFirstItemOutOfStock();
        expect(aFI.getPrice()).toEqual("-14,00 €");

        expect(aFI.countItemsNotInInventory()).toBe(1);
        expect(aFI.countItemsInInventory()).toBe(2);
        aFI.clickValidate();
        expect(aFI.getPrice()).toEqual("0,00 €");
    });

    it('should add a stockitem by barcode', function() {
        aFI.enterBarcode('123');
        expect(aFI.getPrice()).toEqual("0,50 €");
        expect(aFI.countItemsNotInInventory()).toBe(2);
        expect(aFI.countItemsInInventory()).toBe(1);
        aFI.enterBarcode('123456');
        expect(aFI.getPrice()).toEqual("1,10 €");
        expect(aFI.countItemsNotInInventory()).toBe(1);
        expect(aFI.countItemsInInventory()).toBe(2);
        aFI.enterBarcode('123456');
        expect(aFI.getPrice()).toEqual("1,70 €");
        expect(aFI.countItemsNotInInventory()).toBe(1);
        expect(aFI.countItemsInInventory()).toBe(2);
        aFI.enterBarcode('123456789');
        expect(aFI.getPrice()).toEqual("7,70 €");
        expect(aFI.countItemsNotInInventory()).toBe(1);
        expect(aFI.countItemsInInventory()).toBe(2);
    });

    it('should remove a stockitem from the inventory', function() {
        aFI.removeLastItem();
        expect(aFI.countItemsNotInInventory()).toBe(2);
        expect(aFI.countItemsInInventory()).toBe(1);
        expect(aFI.getPrice()).toEqual("0,50 €");
        aFI.removeLastItem();
        expect(aFI.countItemsNotInInventory()).toBe(2);
        expect(aFI.countItemsInInventory()).toBe(0);
        expect(aFI.getPrice()).toEqual("0,00 €");
    });

    it('should verify the empty stock', function() {
        fL.go();
        expect(fL.getRowText(0)).toMatch(/Coca-Cola/);
        expect(fL.getRowText(0)).toMatch(/0 canette/);
        expect(fL.getRowText(0)).toMatch(/0,66 € \/ canette/);
        expect(fL.getRowText(0)).toMatch(/0,00 €/);

        fL.toggleRow(0);

        expect(fL.getSubRowText(0, 1)).toMatch(/Canette de 33 cl de Coca-Cola/);
        expect(fL.getSubRowText(0, 1)).not.toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(fL.getSubRowText(0, 1)).toMatch(/0 canette/);
        expect(fL.getSubRowText(0, 1)).toMatch(/0,60 € \/ canette/);
        expect(fL.getSubRowText(0, 1)).toMatch(/0,00 €/);

        expect(fL.getSubRowText(0, 2)).toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(fL.getSubRowText(0, 2)).toMatch(/0 canette/);
        expect(fL.getSubRowText(0, 2)).toMatch(/0,72 € \/ canette/);
        expect(fL.getSubRowText(0, 2)).toMatch(/0,00 €/);

        fL.toggleRow(0);
    });
});
