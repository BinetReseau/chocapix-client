var AdminFoodCreation = require('./newitem.po.js');
var FoodList = require('../../food/list.food.po.js');

describe('Food creation', function() {
    var AFD = new AdminFoodCreation();
    var FL = new FoodList();

    it('should create a simple item', function() {
        // Création d'un aliment
        AFD.go();

        AFD.setBarcode('123');
        expect(AFD.isBarcodeErrorDisplayed()).toBe(false);
        AFD.setItemDetailsName('Coca-Cola');
        AFD.setItemDetailsContainer('Canette');
        AFD.setItemDetailsContainerPlural('s');
        AFD.setItemDetailsUnit('cl');
        AFD.setItemDetailsContainerQty('33');

        expect(AFD.getItemDetailsPreview()).toEqual('Appro de 4 Canettes de 33 cl de Coca-Cola');

        AFD.setSellItemName('Coca-Cola');
        AFD.setSellItemUnitName('canette');
        AFD.setSellItemUnitNamePlural('s');
        AFD.setStockItemSellToBuy('1');
        AFD.setPrice('0.5');

        expect(AFD.getSellItemPreview()).toEqual('Achat de 53 canettes de Coca-Cola pour 31,80 €');

        AFD.clickValidate();

        expect(AFD.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        AFD.closeLastAlert();
    });

    it('should create a new item rattached to an existing SellItem', function() {
        AFD.setBarcode('123456');
        expect(AFD.isBarcodeErrorDisplayed()).toBe(false);
        AFD.setItemDetailsName('Coca-Cola Light');
        AFD.setItemDetailsContainer('Canette');
        AFD.setItemDetailsContainerPlural('s');
        AFD.setItemDetailsUnit('cl');
        AFD.setItemDetailsContainerQty('33');

        expect(AFD.getItemDetailsPreview()).toEqual('Appro de 4 Canettes de 33 cl de Coca-Cola Light');

        AFD.clickAlreadySell();

        AFD.setOldSellItem('Coc');
        expect(AFD.getOldSellItem()).toEqual('Coca-Cola');

        AFD.setStockItemSellToBuy('1');
        AFD.setPrice('0.6');

        expect(AFD.getSellItemPreview()).toEqual('Achat de 53 canettes de Coca-Cola pour 38,16 €');

        AFD.clickValidate();

        expect(AFD.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        AFD.closeLastAlert();
    });

    it('should create a pack for an existing item', function() {
        AFD.setBarcode('123456789');
        expect(AFD.isBarcodeErrorDisplayed()).toBe(false);

        AFD.clickPack();

        AFD.setBuyItemQty('10');
        AFD.setItemInPack('Coc lig');
        expect(AFD.getItemInPack()).toEqual('Coca-Cola Light');

        AFD.setPrice('5');

        AFD.clickValidate();

        expect(AFD.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        AFD.closeLastAlert();

        AFD.setBarcode('1234567890');
        expect(AFD.isBarcodeErrorDisplayed()).toBe(false);
        AFD.clickPack();
        AFD.setBuyItemQty('10');
        AFD.setItemInPack('Coc');
        expect(AFD.getItemInPack()).toEqual('Coca-Cola');
        AFD.setPrice('4');
        AFD.clickValidate();
        expect(AFD.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        AFD.closeLastAlert();
    });

    it('should not be able to add a barcode already in the bar', function() {
        AFD.setBarcode('123456');
        expect(AFD.isBarcodeErrorDisplayed()).toBe(true);

        expect(AFD.isItemDetailsNameEnabled()).toBe(false);
        expect(AFD.isItemDetailsContainerEnabled()).toBe(false);
        expect(AFD.isItemDetailsContainerPluralEnabled()).toBe(false);
        expect(AFD.isItemDetailsUnitEnabled()).toBe(false);
        // expect(AFD.isItemDetailsContainerQtyEnabled()).toBe(false);

        expect(AFD.isSellItemNameEnabled()).toBe(false);
        expect(AFD.isSellItemUnitNameEnabled()).toBe(false);
        expect(AFD.isSellItemUnitNamePluralEnabled()).toBe(false);
        expect(AFD.isStockItemSellToBuyEnabled()).toBe(false);

        expect(AFD.isValidateEnabled()).toBe(false);
        expect(AFD.isPackChoiceEnabled()).toBe(false);
        expect(AFD.isNotPackChoiceEnabled()).toBe(false);
        expect(AFD.isAlreadySellChoiceEnabled()).toBe(false);
        expect(AFD.isNotYetSellChoiceEnabled()).toBe(false);

        // expect(AFD.isBuyItemQtyEnabled()).toBe(false);
        // expect(AFD.isItemInPackEnabled()).toBe(false);

        // expect(AFD.isOldSellItemEnabled()).toBe(false);
    });

    it('should create a more complet item', function() {
        // Création d'un aliment
        AFD.go();

        AFD.setBarcode('99990');
        expect(AFD.isBarcodeErrorDisplayed()).toBe(false);
        AFD.setItemDetailsName('Pringles Nature');
        AFD.setItemDetailsContainer('Boite');
        AFD.setItemDetailsContainerPlural('s');
        AFD.setItemDetailsUnit('g');
        AFD.setItemDetailsContainerQty('160');

        expect(AFD.getItemDetailsPreview()).toEqual('Appro de 4 Boites de 160 g de Pringles Nature');

        AFD.setSellItemName('Pringles Nature');
        AFD.setSellItemUnitName('g');
        AFD.setStockItemSellToBuy('160');
        AFD.setPrice('1.60');

        expect(AFD.getSellItemPreview()).toEqual('Achat de 53 g de Pringles Nature pour 0,64 €');

        AFD.clickValidate();

        expect(AFD.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        AFD.closeLastAlert();
    });

    it('should verify the created items', function() {
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

        expect(FL.getRowText(1)).toMatch(/Pringles Nature/);
        expect(FL.getRowText(1)).toMatch(/0 g/);
        expect(FL.getRowText(1)).toMatch(/0,01 € \/ g/);
        expect(FL.getRowText(1)).toMatch(/0,00 €/);
    });
});
