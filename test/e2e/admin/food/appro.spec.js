var AdminFoodAppro = require('./appro.po.js');
var FoodList = require('../../food/list.food.po.js');
var foodList = new FoodList();

describe('Appro', function() {
    var adminFoodAppro = new AdminFoodAppro();

    it('should add items by barcode', function() {
        adminFoodAppro.go();

        expect(adminFoodAppro.getPrice()).toEqual("0,00 €");

        adminFoodAppro.setSearch('123');
        expect(adminFoodAppro.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(adminFoodAppro.getPrice()).toEqual("0,50 €");

        adminFoodAppro.setSearch('1234567890');
        expect(adminFoodAppro.getRowText(0)).toMatch(/10 Canettes de 33 cl de Coca-Cola/);
        expect(adminFoodAppro.getPrice()).toEqual("4,50 €");

        adminFoodAppro.setSearch('123456789');
        expect(adminFoodAppro.getRowText(0)).toMatch(/10 Canettes de 33 cl de Coca-Cola Light/);
        expect(adminFoodAppro.getPrice()).toEqual("9,50 €");

        adminFoodAppro.setSearch('123456789');
        expect(adminFoodAppro.getPrice()).toEqual("14,50 €");

        adminFoodAppro.validate();

        expect(adminFoodAppro.getPrice()).toEqual("0,00 €");
    });

    it('should add items by name', function() {
        adminFoodAppro.setSearch('123');
        expect(adminFoodAppro.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(adminFoodAppro.getPrice()).toEqual("0,50 €");

        adminFoodAppro.setSearch('Coc Ligh');
        expect(adminFoodAppro.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(adminFoodAppro.getPrice()).toEqual("1,10 €");

        adminFoodAppro.setSearch('Coc Ligh');
        expect(adminFoodAppro.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(adminFoodAppro.getPrice()).toEqual("1,70 €");

        adminFoodAppro.setSearch('123');
        expect(adminFoodAppro.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(adminFoodAppro.getRowText(1)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(adminFoodAppro.getPrice()).toEqual("2,20 €");

        adminFoodAppro.validate();

        expect(adminFoodAppro.getPrice()).toEqual("0,00 €");
    });

    it('should see correct stocks', function() {
        foodList.go();

        expect(foodList.getRowText(0)).toMatch(/Coca-Cola/);
        expect(foodList.getRowText(0)).toMatch(/35 canettes/);
        expect(foodList.getRowText(0)).toMatch(/0,57 € \/ canette/);
        expect(foodList.getRowText(0)).toMatch(/19,92 €/);

        foodList.toggleRow(0);

        expect(foodList.getSubRowText(0, 1)).toMatch(/Canette de 33 cl de Coca-Cola/);
        expect(foodList.getSubRowText(0, 1)).not.toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(foodList.getSubRowText(0, 1)).toMatch(/13 canettes/);
        expect(foodList.getSubRowText(0, 1)).toMatch(/0,50 € \/ canette/);
        expect(foodList.getSubRowText(0, 1)).toMatch(/6,48 €/);

        expect(foodList.getSubRowText(0, 2)).toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(foodList.getSubRowText(0, 2)).toMatch(/22 canettes/);
        expect(foodList.getSubRowText(0, 2)).toMatch(/0,61 € \/ canette/);
        expect(foodList.getSubRowText(0, 2)).toMatch(/13,44 €/);

        foodList.toggleRow(0);
    });

    it('should add items by name with new temporary prices', function() {
        adminFoodAppro.go();

        adminFoodAppro.setSearch('123');
        expect(adminFoodAppro.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(adminFoodAppro.getPrice()).toEqual("0,50 €");
        adminFoodAppro.setRowPrice(0, "1");
        adminFoodAppro.toggleRowPermanent(0);
        expect(adminFoodAppro.getPrice()).toEqual("1,00 €");

        adminFoodAppro.setSearch('Coc Ligh');
        expect(adminFoodAppro.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        adminFoodAppro.setRowPrice(0, "2");
        adminFoodAppro.toggleRowPermanent(0);
        expect(adminFoodAppro.getPrice()).toEqual("3,00 €");

        adminFoodAppro.setSearch('Coc Ligh');
        expect(adminFoodAppro.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(adminFoodAppro.getPrice()).toEqual("5,00 €");

        adminFoodAppro.setSearch('123');
        expect(adminFoodAppro.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(adminFoodAppro.getRowText(1)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(adminFoodAppro.getPrice()).toEqual("6,00 €");

        adminFoodAppro.validate();

        expect(adminFoodAppro.getPrice()).toEqual("0,00 €");


        // Check that buyitemprices have not been updated
        adminFoodAppro.setSearch('123');
        expect(adminFoodAppro.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(adminFoodAppro.getPrice()).toEqual("0,50 €");

        adminFoodAppro.setSearch('Coc Ligh');
        expect(adminFoodAppro.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(adminFoodAppro.getPrice()).toEqual("1,10 €");

        // And we remove items
        adminFoodAppro.removeRow(0);
        adminFoodAppro.removeRow(0);
        expect(adminFoodAppro.getPrice()).toEqual("0,00 €");
    });

    it('should see correct stocks and prices', function() {
        foodList.go();

        expect(foodList.getRowText(0)).toMatch(/Coca-Cola/);
        expect(foodList.getRowText(0)).toMatch(/39 canettes/);
        expect(foodList.getRowText(0)).toMatch(/0,70 € \/ canette/);
        expect(foodList.getRowText(0)).toMatch(/27,12 €/);

        foodList.toggleRow(0);

        expect(foodList.getSubRowText(0, 1)).toMatch(/Canette de 33 cl de Coca-Cola/);
        expect(foodList.getSubRowText(0, 1)).not.toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(foodList.getSubRowText(0, 1)).toMatch(/15 canettes/);
        expect(foodList.getSubRowText(0, 1)).toMatch(/0,59 € \/ canette/);
        expect(foodList.getSubRowText(0, 1)).toMatch(/8,88 €/);

        expect(foodList.getSubRowText(0, 2)).toMatch(/Canette de 33 cl de Coca-Cola Light/);
        expect(foodList.getSubRowText(0, 2)).toMatch(/24 canettes/);
        expect(foodList.getSubRowText(0, 2)).toMatch(/0,76 € \/ canette/);
        expect(foodList.getSubRowText(0, 2)).toMatch(/18,24 €/);

        foodList.toggleRow(0);
    });

    it('should add items with new permanent prices', function() {
        adminFoodAppro.go();

        adminFoodAppro.setSearch('123');
        expect(adminFoodAppro.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(adminFoodAppro.getPrice()).toEqual("0,50 €");
        adminFoodAppro.setRowPrice(0, "1");
        expect(adminFoodAppro.getPrice()).toEqual("1,00 €");

        adminFoodAppro.setSearch('Coc Ligh');
        expect(adminFoodAppro.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        adminFoodAppro.setRowPrice(0, "2");
        expect(adminFoodAppro.getPrice()).toEqual("3,00 €");

        adminFoodAppro.validate();

        expect(adminFoodAppro.getPrice()).toEqual("0,00 €");

        // Check that buyitemprices have been updated
        adminFoodAppro.setSearch('123');
        expect(adminFoodAppro.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(adminFoodAppro.getPrice()).toEqual("1,00 €");

        adminFoodAppro.setSearch('Coc Ligh');
        expect(adminFoodAppro.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(adminFoodAppro.getPrice()).toEqual("3,00 €");

        // And we remove items
        adminFoodAppro.removeRow(0);
        adminFoodAppro.removeRow(0);
        expect(adminFoodAppro.getPrice()).toEqual("0,00 €");
    });
});
