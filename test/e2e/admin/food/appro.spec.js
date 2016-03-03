var AdminFoodAppro = require('./appro.po.js');
var FoodList = require('../../food/list.food.po.js');
var foodList = new FoodList();

describe('Appro', function() {
    var AFA = new AdminFoodAppro();

    it('should add items by barcode', function() {
        AFA.go();

        expect(AFA.getPrice()).toEqual("0,00 €");

        AFA.setSearch('123');
        expect(AFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(AFA.getPrice()).toEqual("0,50 €");

        AFA.setSearch('1234567890');
        expect(AFA.getRowText(0)).toMatch(/10 Canettes de 33 cl de Coca-Cola/);
        expect(AFA.getPrice()).toEqual("4,50 €");

        AFA.setSearch('123456789');
        expect(AFA.getRowText(0)).toMatch(/10 Canettes de 33 cl de Coca-Cola Light/);
        expect(AFA.getPrice()).toEqual("9,50 €");

        AFA.setSearch('123456789');
        expect(AFA.getPrice()).toEqual("14,50 €");

        AFA.validate();

        expect(AFA.getPrice()).toEqual("0,00 €");
    });

    it('should add items by name', function() {
        AFA.setSearch('123');
        expect(AFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(AFA.getPrice()).toEqual("0,50 €");

        AFA.setSearch('Coc Ligh');
        expect(AFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(AFA.getPrice()).toEqual("1,10 €");

        AFA.setSearch('Coc Ligh');
        expect(AFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(AFA.getPrice()).toEqual("1,70 €");

        AFA.setSearch('123');
        expect(AFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(AFA.getRowText(1)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(AFA.getPrice()).toEqual("2,20 €");

        AFA.validate();

        expect(AFA.getPrice()).toEqual("0,00 €");
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
        AFA.go();

        AFA.setSearch('123');
        expect(AFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(AFA.getPrice()).toEqual("0,50 €");
        AFA.setRowPrice(0, "1");
        AFA.toggleRowPermanent(0);
        expect(AFA.getPrice()).toEqual("1,00 €");

        AFA.setSearch('Coc Ligh');
        expect(AFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        AFA.setRowPrice(0, "2");
        AFA.toggleRowPermanent(0);
        expect(AFA.getPrice()).toEqual("3,00 €");

        AFA.setSearch('Coc Ligh');
        expect(AFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(AFA.getPrice()).toEqual("5,00 €");

        AFA.setSearch('123');
        expect(AFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(AFA.getRowText(1)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(AFA.getPrice()).toEqual("6,00 €");

        AFA.validate();

        expect(AFA.getPrice()).toEqual("0,00 €");


        // Check that buyitemprices have not been updated
        AFA.setSearch('123');
        expect(AFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(AFA.getPrice()).toEqual("0,50 €");

        AFA.setSearch('Coc Ligh');
        expect(AFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(AFA.getPrice()).toEqual("1,10 €");

        // And we remove items
        AFA.removeRow(0);
        AFA.removeRow(0);
        expect(AFA.getPrice()).toEqual("0,00 €");
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
        AFA.go();

        AFA.setSearch('123');
        expect(AFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(AFA.getPrice()).toEqual("0,50 €");
        AFA.setRowPrice(0, "1");
        expect(AFA.getPrice()).toEqual("1,00 €");

        AFA.setSearch('Coc Ligh');
        expect(AFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        AFA.setRowPrice(0, "2");
        expect(AFA.getPrice()).toEqual("3,00 €");

        AFA.validate();

        expect(AFA.getPrice()).toEqual("0,00 €");

        // Check that buyitemprices have been updated
        AFA.setSearch('123');
        expect(AFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola/);
        expect(AFA.getPrice()).toEqual("1,00 €");

        AFA.setSearch('Coc Ligh');
        expect(AFA.getRowText(0)).toMatch(/1 Canette de 33 cl de Coca-Cola Light/);
        expect(AFA.getPrice()).toEqual("3,00 €");

        // And we remove items
        AFA.removeRow(0);
        AFA.removeRow(0);
        expect(AFA.getPrice()).toEqual("0,00 €");
    });
});
