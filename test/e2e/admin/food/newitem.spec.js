var AdminFoodCreation = require('./newitem.po.js');
var FoodList = require('../../food/list.food.po.js');

describe('Food creation', function() {
    var aFD = new AdminFoodCreation();
    var fL = new FoodList();

    it('should create a simple item', function() {
        // Création d'un aliment
        aFD.go();

        aFD.setBarcode('123');
        expect(aFD.isBarcodeErrorDisplayed()).toBe(false);
        aFD.setItemDetailsName('Coca-Cola');
        aFD.setItemDetailsContainer('Canette');
        aFD.setItemDetailsContainerPlural('s');
        aFD.setItemDetailsUnit('cl');
        aFD.setItemDetailsContainerQty('33');

        expect(aFD.getItemDetailsPreview()).toEqual('Appro de 4 Canettes de 33 cl de Coca-Cola');

        aFD.setSellItemName('Coca-Cola');
        aFD.setSellItemUnitName('canette');
        aFD.setSellItemUnitNamePlural('s');
        aFD.setStockItemSellToBuy('1');
        aFD.setPrice('0.5');

        expect(aFD.getSellItemPreview()).toEqual('Achat de 53 canettes de Coca-Cola pour 31,80 €');

        aFD.clickValidate();

        expect(aFD.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        aFD.closeLastAlert();
    });

    it('should create a new item rattached to an existing SellItem', function() {
        aFD.setBarcode('123456');
        expect(aFD.isBarcodeErrorDisplayed()).toBe(false);
        aFD.setItemDetailsName('Coca-Cola Light');
        aFD.setItemDetailsContainer('Canette');
        aFD.setItemDetailsContainerPlural('s');
        aFD.setItemDetailsUnit('cl');
        aFD.setItemDetailsContainerQty('33');

        expect(aFD.getItemDetailsPreview()).toEqual('Appro de 4 Canettes de 33 cl de Coca-Cola Light');

        aFD.clickAlreadySell();

        aFD.setOldSellItem('Coc');
        expect(aFD.getOldSellItem()).toEqual('Coca-Cola');

        aFD.setStockItemSellToBuy('1');
        aFD.setPrice('0.6');

        expect(aFD.getSellItemPreview()).toEqual('Achat de 53 canettes de Coca-Cola pour 38,16 €');

        aFD.clickValidate();

        expect(aFD.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        aFD.closeLastAlert();
    });

    it('should create a pack for an existing item', function() {
        aFD.setBarcode('123456789');
        expect(aFD.isBarcodeErrorDisplayed()).toBe(false);

        aFD.clickPack();

        aFD.setBuyItemQty('10');
        aFD.setItemInPack('Coc lig');
        expect(aFD.getItemInPack()).toEqual('Coca-Cola Light');

        aFD.setPrice('5');

        aFD.clickValidate();

        expect(aFD.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        aFD.closeLastAlert();

        aFD.setBarcode('1234567890');
        expect(aFD.isBarcodeErrorDisplayed()).toBe(false);
        aFD.clickPack();
        aFD.setBuyItemQty('10');
        aFD.setItemInPack('Coc');
        expect(aFD.getItemInPack()).toEqual('Coca-Cola');
        aFD.setPrice('4');
        aFD.clickValidate();
        expect(aFD.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        aFD.closeLastAlert();
    });

    it('should not be able to add a barcode already in the bar', function() {
        aFD.setBarcode('123456');
        expect(aFD.isBarcodeErrorDisplayed()).toBe(true);

        expect(aFD.isItemDetailsNameEnabled()).toBe(false);
        expect(aFD.isItemDetailsContainerEnabled()).toBe(false);
        expect(aFD.isItemDetailsContainerPluralEnabled()).toBe(false);
        expect(aFD.isItemDetailsUnitEnabled()).toBe(false);
        // expect(aFD.isItemDetailsContainerQtyEnabled()).toBe(false);

        expect(aFD.isSellItemNameEnabled()).toBe(false);
        expect(aFD.isSellItemUnitNameEnabled()).toBe(false);
        expect(aFD.isSellItemUnitNamePluralEnabled()).toBe(false);
        expect(aFD.isStockItemSellToBuyEnabled()).toBe(false);

        expect(aFD.isValidateEnabled()).toBe(false);
        expect(aFD.isPackChoiceEnabled()).toBe(false);
        expect(aFD.isNotPackChoiceEnabled()).toBe(false);
        expect(aFD.isAlreadySellChoiceEnabled()).toBe(false);
        expect(aFD.isNotYetSellChoiceEnabled()).toBe(false);

        // expect(aFD.isBuyItemQtyEnabled()).toBe(false);
        // expect(aFD.isItemInPackEnabled()).toBe(false);

        // expect(aFD.isOldSellItemEnabled()).toBe(false);
    });

    it('should create a more complet item', function() {
        // Création d'un aliment
        aFD.go();

        aFD.setBarcode('99990');
        expect(aFD.isBarcodeErrorDisplayed()).toBe(false);
        aFD.setItemDetailsName('Pringles Nature');
        aFD.setItemDetailsContainer('Boite');
        aFD.setItemDetailsContainerPlural('s');
        aFD.setItemDetailsUnit('g');
        aFD.setItemDetailsContainerQty('160');

        expect(aFD.getItemDetailsPreview()).toEqual('Appro de 4 Boites de 160 g de Pringles Nature');

        aFD.setSellItemName('Pringles Nature');
        aFD.setSellItemUnitName('g');
        aFD.setStockItemSellToBuy('160');
        aFD.setPrice('1.60');

        expect(aFD.getSellItemPreview()).toEqual('Achat de 53 g de Pringles Nature pour 0,64 €');

        aFD.clickValidate();

        expect(aFD.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        aFD.closeLastAlert();
    });

    it('should verify the created items', function() {
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

        expect(fL.getRowText(1)).toMatch(/Pringles Nature/);
        expect(fL.getRowText(1)).toMatch(/0 g/);
        expect(fL.getRowText(1)).toMatch(/0,01 € \/ g/);
        expect(fL.getRowText(1)).toMatch(/0,00 €/);
    });
});
