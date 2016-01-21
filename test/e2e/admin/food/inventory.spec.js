var AdminFoodInventory = require('./inventory.po.js');
var FoodList = require('../../food/list.food.po.js');

describe('Inventory', function() {
    var adminFoodInventory = new AdminFoodInventory();
    var foodList = new FoodList();

    it('should add stockitems via the list and validate', function() {
        adminFoodInventory.go();

        element(by.linkText('Coca-Cola')).click();
        element(by.linkText('Canette de 33 cl de Coca-Cola')).click();

        expect(adminFoodInventory.getPrice()).toEqual("0,50 €");
        adminFoodInventory.changeLastItemQty("0"); // Comme de base il y a 1 dans le champ, là on rajoute simplement un 0 ce qui fait donc 10
        expect(adminFoodInventory.getPrice()).toEqual("5,00 €");

        element(by.linkText('Canette de 33 cl de Coca-Cola Light')).click();
        expect(adminFoodInventory.getPrice()).toEqual("5,60 €");
        adminFoodInventory.changeLastItemQty("5"); // Là la quantité passe à 15
        expect(adminFoodInventory.getPrice()).toEqual("14,00 €");

        adminFoodInventory.clickValidate();
        expect(adminFoodInventory.getPrice()).toEqual("0,00 €");
    });

    it('should verify the updated stock', function() {
        foodList.go();
        expect(foodList.getRowText(0)).toMatch(/Coca-Cola/);
        expect(foodList.getRowText(0)).toMatch(/25 canettes/);
        expect(foodList.getRowText(0)).toMatch(/0,67 € \/ canette/);
        expect(foodList.getRowText(0)).toMatch(/16,80 €/);

        foodList.toggleRow(0);

        expect(foodList.getSubRowText(0, 1)).toMatch(/Canette de 33 cl de Coca-Cola/);
        expect(foodList.getSubRowText(0, 1)).not.toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(foodList.getSubRowText(0, 1)).toMatch(/10 canettes/);
        expect(foodList.getSubRowText(0, 1)).toMatch(/0,60 € \/ canette/);
        expect(foodList.getSubRowText(0, 1)).toMatch(/6,00 €/);

        expect(foodList.getSubRowText(0, 2)).toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(foodList.getSubRowText(0, 2)).toMatch(/15 canettes/);
        expect(foodList.getSubRowText(0, 2)).toMatch(/0,72 € \/ canette/);
        expect(foodList.getSubRowText(0, 2)).toMatch(/10,80 €/);

        foodList.toggleRow(0);
    });

    it('should add a sellitem out of stock', function() {
        adminFoodInventory.go();

        adminFoodInventory.clickFirstItemOutOfStock();
        expect(adminFoodInventory.getPrice()).toEqual("-14,00 €");

        expect(adminFoodInventory.countItemsNotInInventory()).toBe(1);
        expect(adminFoodInventory.countItemsInInventory()).toBe(2);
        adminFoodInventory.clickValidate();
        expect(adminFoodInventory.getPrice()).toEqual("0,00 €");
    });

    it('should add a stockitem by barcode', function() {
        adminFoodInventory.enterBarcode('123');
        expect(adminFoodInventory.getPrice()).toEqual("0,50 €");
        expect(adminFoodInventory.countItemsNotInInventory()).toBe(2);
        expect(adminFoodInventory.countItemsInInventory()).toBe(1);
        adminFoodInventory.enterBarcode('123456');
        expect(adminFoodInventory.getPrice()).toEqual("1,10 €");
        expect(adminFoodInventory.countItemsNotInInventory()).toBe(1);
        expect(adminFoodInventory.countItemsInInventory()).toBe(2);
        adminFoodInventory.enterBarcode('123456');
        expect(adminFoodInventory.getPrice()).toEqual("1,70 €");
        expect(adminFoodInventory.countItemsNotInInventory()).toBe(1);
        expect(adminFoodInventory.countItemsInInventory()).toBe(2);
        adminFoodInventory.enterBarcode('123456789');
        expect(adminFoodInventory.getPrice()).toEqual("7,70 €");
        expect(adminFoodInventory.countItemsNotInInventory()).toBe(1);
        expect(adminFoodInventory.countItemsInInventory()).toBe(2);
    });

    it('should remove a stockitem from the inventory', function() {
        adminFoodInventory.removeLastItem();
        expect(adminFoodInventory.countItemsNotInInventory()).toBe(2);
        expect(adminFoodInventory.countItemsInInventory()).toBe(1);
        expect(adminFoodInventory.getPrice()).toEqual("0,50 €");
        adminFoodInventory.removeLastItem();
        expect(adminFoodInventory.countItemsNotInInventory()).toBe(2);
        expect(adminFoodInventory.countItemsInInventory()).toBe(0);
        expect(adminFoodInventory.getPrice()).toEqual("0,00 €");
    });

    it('should verify the empty stock', function() {
        foodList.go();
        expect(foodList.getRowText(0)).toMatch(/Coca-Cola/);
        expect(foodList.getRowText(0)).toMatch(/0 canette/);
        expect(foodList.getRowText(0)).toMatch(/0,66 € \/ canette/);
        expect(foodList.getRowText(0)).toMatch(/0,00 €/);

        foodList.toggleRow(0);

        expect(foodList.getSubRowText(0, 1)).toMatch(/Canette de 33 cl de Coca-Cola/);
        expect(foodList.getSubRowText(0, 1)).not.toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(foodList.getSubRowText(0, 1)).toMatch(/0 canette/);
        expect(foodList.getSubRowText(0, 1)).toMatch(/0,60 € \/ canette/);
        expect(foodList.getSubRowText(0, 1)).toMatch(/0,00 €/);

        expect(foodList.getSubRowText(0, 2)).toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(foodList.getSubRowText(0, 2)).toMatch(/0 canette/);
        expect(foodList.getSubRowText(0, 2)).toMatch(/0,72 € \/ canette/);
        expect(foodList.getSubRowText(0, 2)).toMatch(/0,00 €/);

        foodList.toggleRow(0);
    });
});
