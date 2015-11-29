var AdminFoodAppro = require('./appro.po.js');

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
});
