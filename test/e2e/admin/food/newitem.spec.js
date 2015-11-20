var AdminFoodCreation = require('./newitem.po.js');

describe('Food creation', function() {
    var adminFoodCreation = new AdminFoodCreation();

    it('should create a simple item', function() {
        // Création d'un aliment
        adminFoodCreation.go();

        adminFoodCreation.setBarcode('123');
        expect(adminFoodCreation.isBarcodeErrorDisplayed()).toBe(false);
        adminFoodCreation.setItemDetailsName('Coca-Cola');
        adminFoodCreation.setItemDetailsContainer('Canette');
        adminFoodCreation.setItemDetailsContainerPlural('s');
        adminFoodCreation.setItemDetailsUnit('cl');
        adminFoodCreation.setItemDetailsContainerQty('33');

        expect(adminFoodCreation.getItemDetailsPreview()).toEqual('Appro de 4 Canettes de 33 cl de Coca-Cola');

        adminFoodCreation.setSellItemName('Coca-Cola');
        adminFoodCreation.setSellItemUnitName('canette');
        adminFoodCreation.setSellItemUnitNamePlural('s');
        adminFoodCreation.setStockItemSellToBuy('1');
        adminFoodCreation.setPrice('0.5');

        expect(adminFoodCreation.getSellItemPreview()).toEqual('Achat de 53 canettes de Coca-Cola pour 31,80 €');

        adminFoodCreation.clickValidate();

        expect(adminFoodCreation.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        adminFoodCreation.closeLastAlert();
    });

    it('should create a new item rattached to an existing SellItem', function() {
        adminFoodCreation.setBarcode('123456');
        expect(adminFoodCreation.isBarcodeErrorDisplayed()).toBe(false);
        adminFoodCreation.setItemDetailsName('Coca-Cola Light');
        adminFoodCreation.setItemDetailsContainer('Canette');
        adminFoodCreation.setItemDetailsContainerPlural('s');
        adminFoodCreation.setItemDetailsUnit('cl');
        adminFoodCreation.setItemDetailsContainerQty('33');

        expect(adminFoodCreation.getItemDetailsPreview()).toEqual('Appro de 4 Canettes de 33 cl de Coca-Cola Light');

        adminFoodCreation.clickAlreadySell();

        adminFoodCreation.setOldSellItem('Coc');
        expect(adminFoodCreation.getOldSellItem()).toEqual('Coca-Cola');

        adminFoodCreation.setStockItemSellToBuy('1');
        adminFoodCreation.setPrice('0.6');

        expect(adminFoodCreation.getSellItemPreview()).toEqual('Achat de 53 canettes de Coca-Cola pour 38,16 €');

        adminFoodCreation.clickValidate();

        expect(adminFoodCreation.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        adminFoodCreation.closeLastAlert();
    });

    it('should create a pack for an existing item', function() {
        adminFoodCreation.setBarcode('123456789');
        expect(adminFoodCreation.isBarcodeErrorDisplayed()).toBe(false);

        adminFoodCreation.clickPack();

        adminFoodCreation.setBuyItemQty('10');
        adminFoodCreation.setItemInPack('Coc lig');
        expect(adminFoodCreation.getItemInPack()).toEqual('Coca-Cola Light');

        adminFoodCreation.setPrice('5');

        adminFoodCreation.clickValidate();

        expect(adminFoodCreation.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        adminFoodCreation.closeLastAlert();

!
        adminFoodCreation.setBarcode('1234567890');
        expect(adminFoodCreation.isBarcodeErrorDisplayed()).toBe(false);
        adminFoodCreation.clickPack();
        adminFoodCreation.setBuyItemQty('10');
        adminFoodCreation.setItemInPack('Coc');
        expect(adminFoodCreation.getItemInPack()).toEqual('Coca-Cola');
        adminFoodCreation.setPrice('4');
        adminFoodCreation.clickValidate();
        expect(adminFoodCreation.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        adminFoodCreation.closeLastAlert();
    });

    it('should not be able to add a barcode already in the bar', function() {
        adminFoodCreation.setBarcode('123456');
        expect(adminFoodCreation.isBarcodeErrorDisplayed()).toBe(true);

        expect(adminFoodCreation.isItemDetailsNameEnabled()).toBe(false);
        expect(adminFoodCreation.isItemDetailsContainerEnabled()).toBe(false);
        expect(adminFoodCreation.isItemDetailsContainerPluralEnabled()).toBe(false);
        expect(adminFoodCreation.isItemDetailsUnitEnabled()).toBe(false);
        expect(adminFoodCreation.isItemDetailsContainerQtyEnabled()).toBe(false);

        expect(adminFoodCreation.isSellItemNameEnabled()).toBe(false);
        expect(adminFoodCreation.isSellItemUnitNameEnabled()).toBe(false);
        expect(adminFoodCreation.isSellItemUnitNamePluralEnabled()).toBe(false);
        expect(adminFoodCreation.isStockItemSellToBuyEnabled()).toBe(false);

        expect(adminFoodCreation.isValidateEnabled()).toBe(false);
        expect(adminFoodCreation.isPackChoiceEnabled()).toBe(false);
        expect(adminFoodCreation.isNotPackChoiceEnabled()).toBe(false);
        expect(adminFoodCreation.isAlreadySellChoiceEnabled()).toBe(false);
        expect(adminFoodCreation.isNotYetSellChoiceEnabled()).toBe(false);

        expect(adminFoodCreation.isBuyItemQtyEnabled()).toBe(false);
        expect(adminFoodCreation.isItemInPackEnabled()).toBe(false);

        expect(adminFoodCreation.isOldSellItemEnabled()).toBe(false);
    });
});
