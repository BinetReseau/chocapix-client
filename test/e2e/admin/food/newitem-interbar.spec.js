var AdminFoodCreation = require('./newitem.po.js');
var BarsBarPage = require('../../bar/bar.po.js');
var FoodList = require('../../food/list.food.po.js');

describe('Food creation inter-bars', function() {
    var aFC = new AdminFoodCreation();
    var barsBarPage = new BarsBarPage();
    var fL = new FoodList();

    it('should create a simple food existing in an other bar', function() {
        barsBarPage.changeToBar('Natation Jône');

        aFC.go();

        // Code barre existant en aviron jone
        aFC.setBarcode('123');
        expect(aFC.isBarcodeErrorDisplayed()).toBe(false);

        // On vérifie que les infos sont bien récupérés
        expect(aFC.getItemDetailsName()).toEqual('Coca-Cola');
        expect(aFC.getItemDetailsNamePlural()).toEqual('Coca-Cola');
        expect(aFC.getItemDetailsContainer()).toEqual('Canette');
        expect(aFC.getItemDetailsContainerPlural()).toEqual('Canettes');
        expect(aFC.getItemDetailsUnit()).toEqual('cl');
        expect(aFC.getItemDetailsContainerQty()).toEqual('33');

        // On vérifie qu'on ne peut pas les modifier
        expect(aFC.isItemDetailsNameEnabled()).toBe(false);
        expect(aFC.isItemDetailsContainerEnabled()).toBe(false);
        expect(aFC.isItemDetailsContainerPluralEnabled()).toBe(false);
        expect(aFC.isItemDetailsUnitEnabled()).toBe(false);
        expect(aFC.isItemDetailsContainerQtyEnabled()).toBe(false);
        // expect(aFC.isPackChoiceEnabled()).toBe(false);

        expect(aFC.getItemDetailsPreview()).toEqual('Appro de 4 Canettes de 33 cl de Coca-Cola');

        // Les champs doivent être pré-remplis à partir des informations de l'ItemDetails
        expect(aFC.getSellItemName()).toEqual('Coca-Cola');
        expect(aFC.getSellItemNamePlural()).toEqual('Coca-Cola');
        expect(aFC.getSellItemUnitName()).toEqual('cl');
        expect(aFC.getSellItemUnitNamePlural()).toEqual('cl');
        expect(aFC.getStockItemSellToBuy()).toEqual('33');

        // On modifie ces champs
        aFC.setSellItemUnitName('canette', true);
        aFC.setSellItemUnitNamePlural('s');
        aFC.setStockItemSellToBuy('1', true);

        aFC.setPrice('0.5');

        expect(aFC.getSellItemPreview()).toEqual('Achat de 53 canettes de Coca-Cola pour 31,80 €');

        aFC.clickValidate();

        expect(aFC.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        aFC.closeLastAlert();
    });

    it('should create a pack existing in an other bar, for an existing item in the current bar', function() {
        // Code barre existant en aviron jone
        aFC.setBarcode('1234567890');
        expect(aFC.isBarcodeErrorDisplayed()).toBe(false);

        expect(aFC.getBuyItemQty()).toEqual('10');
        expect(aFC.getItemInPack()).toEqual('Coca-Cola');
        aFC.setPrice('4');

        aFC.clickValidate();

        expect(aFC.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        aFC.closeLastAlert();
    });

    it('should create a pack existing in an other bar and the corresponding item', function() {
        aFC.setBarcode('123456789');
        expect(aFC.isBarcodeErrorDisplayed()).toBe(false);

        // On vérifie que les infos sont bien récupérés
        expect(aFC.getItemDetailsName()).toEqual('Coca-Cola Light');
        expect(aFC.getItemDetailsNamePlural()).toEqual('Coca-Cola Light');
        expect(aFC.getItemDetailsContainer()).toEqual('Canette');
        expect(aFC.getItemDetailsContainerPlural()).toEqual('Canettes');
        expect(aFC.getItemDetailsUnit()).toEqual('cl');
        expect(aFC.getItemDetailsContainerQty()).toEqual('33');

        // On vérifie qu'on ne peut pas les modifier
        expect(aFC.isItemDetailsNameEnabled()).toBe(false);
        expect(aFC.isItemDetailsContainerEnabled()).toBe(false);
        expect(aFC.isItemDetailsContainerPluralEnabled()).toBe(false);
        expect(aFC.isItemDetailsUnitEnabled()).toBe(false);
        expect(aFC.isItemDetailsContainerQtyEnabled()).toBe(false);
        // expect(aFC.isPackChoiceEnabled()).toBe(false);

        expect(aFC.getItemDetailsPreview()).toEqual('Appro de 4 Canettes de 33 cl de Coca-Cola Light');

        // Les champs doivent être pré-remplis à partir des informations de l'ItemDetails
        expect(aFC.getSellItemName()).toEqual('Coca-Cola Light');
        expect(aFC.getSellItemNamePlural()).toEqual('Coca-Cola Light');
        expect(aFC.getSellItemUnitName()).toEqual('cl');
        expect(aFC.getSellItemUnitNamePlural()).toEqual('cl');
        expect(aFC.getStockItemSellToBuy()).toEqual('33');

        // On va le rattacher au Coca existant
        aFC.clickAlreadySell();
        aFC.setOldSellItem('Coc');
        expect(aFC.getOldSellItem()).toEqual('Coca-Cola');
        aFC.setStockItemSellToBuy('1', true);
        aFC.setPrice('0.6');
        expect(aFC.getSellItemPreview()).toEqual('Achat de 53 canettes de Coca-Cola pour 38,16 €');

        aFC.clickValidate();
        // browser.pause();
        expect(aFC.getBuyItemQty()).toEqual('10');
        expect(aFC.getItemInPack()).toEqual('Coca-Cola Light');

        aFC.setPrice('5');
        aFC.clickValidate();

        expect(aFC.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        aFC.closeLastAlert();
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

        barsBarPage.changeToBar('Aviron Jône');
    });
});
