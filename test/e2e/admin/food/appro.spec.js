var AdminFoodAppro = require('./appro.po.js');
var FoodList = require('../../food/list.food.po.js');
var foodList = new FoodList();

describe('Appro', function() {
    var aFA = new AdminFoodAppro();

    it('should add items by barcode', function() {
        aFA.go();

        expect(aFA.getPrice()).toEqual("0,00 €");

        aFA.setSearch('123');
        expect(aFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(aFA.getPrice()).toEqual("0,50 €");

        aFA.setSearch('1234567890');
        expect(aFA.getRowText(0)).toMatch(/10 Canettes de 33 cl de Coca-Cola/);
        expect(aFA.getPrice()).toEqual("4,50 €");

        aFA.setSearch('123456789');
        expect(aFA.getRowText(0)).toMatch(/10 Canettes de 33 cl de Coca-Cola Light/);
        expect(aFA.getPrice()).toEqual("9,50 €");

        aFA.setSearch('123456789');
        expect(aFA.getPrice()).toEqual("14,50 €");

        aFA.validate();

        expect(aFA.getPrice()).toEqual("0,00 €");
    });

    it('should add items by name', function() {
        aFA.setSearch('123');
        expect(aFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(aFA.getPrice()).toEqual("0,50 €");

        aFA.setSearch('Coc Ligh');
        expect(aFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(aFA.getPrice()).toEqual("1,10 €");

        aFA.setSearch('Coc Ligh');
        expect(aFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(aFA.getPrice()).toEqual("1,70 €");

        aFA.setSearch('123');
        expect(aFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(aFA.getRowText(1)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(aFA.getPrice()).toEqual("2,20 €");

        aFA.validate();

        expect(aFA.getPrice()).toEqual("0,00 €");
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
        aFA.go();

        aFA.setSearch('123');
        expect(aFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(aFA.getPrice()).toEqual("0,50 €");
        aFA.setRowPrice(0, "1");
        aFA.toggleRowPermanent(0);
        expect(aFA.getPrice()).toEqual("1,00 €");

        aFA.setSearch('Coc Ligh');
        expect(aFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        aFA.setRowPrice(0, "2");
        aFA.toggleRowPermanent(0);
        expect(aFA.getPrice()).toEqual("3,00 €");

        aFA.setSearch('Coc Ligh');
        expect(aFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(aFA.getPrice()).toEqual("5,00 €");

        aFA.setSearch('123');
        expect(aFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(aFA.getRowText(1)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(aFA.getPrice()).toEqual("6,00 €");

        aFA.validate();

        expect(aFA.getPrice()).toEqual("0,00 €");


        // Check that buyitemprices have not been updated
        aFA.setSearch('123');
        expect(aFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(aFA.getPrice()).toEqual("0,50 €");

        aFA.setSearch('Coc Ligh');
        expect(aFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(aFA.getPrice()).toEqual("1,10 €");

        // And we remove items
        aFA.removeRow(0);
        aFA.removeRow(0);
        expect(aFA.getPrice()).toEqual("0,00 €");
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
        aFA.go();

        aFA.setSearch('123');
        expect(aFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(aFA.getPrice()).toEqual("0,50 €");
        aFA.setRowPrice(0, "1");
        expect(aFA.getPrice()).toEqual("1,00 €");

        aFA.setSearch('Coc Ligh');
        expect(aFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        aFA.setRowPrice(0, "2");
        expect(aFA.getPrice()).toEqual("3,00 €");

        aFA.validate();

        expect(aFA.getPrice()).toEqual("0,00 €");

        // Check that buyitemprices have been updated
        aFA.setSearch('123');
        expect(aFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(aFA.getPrice()).toEqual("1,00 €");

        aFA.setSearch('Coc Ligh');
        expect(aFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(aFA.getPrice()).toEqual("3,00 €");

        // And we remove items
        aFA.removeRow(0);
        aFA.removeRow(0);
        expect(aFA.getPrice()).toEqual("0,00 €");
    });
});
