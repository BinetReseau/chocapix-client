var AdminFoodCreation = require('./newitem.po.js');
var BarsBarPage = require('../../bar/bar.po.js');
var FoodList = require('../../food/list.food.po.js');

describe('Food creation inter-bars', function() {
    var AFC = new AdminFoodCreation();
    var barsBarPage = new BarsBarPage();
    var FL = new FoodList();

    it('should create a simple food existing in an other bar', function() {
        barsBarPage.changeToBar('Natation Jône');

        AFC.go();

        // Code barre existant en aviron jone
        AFC.setBarcode('123');
        expect(AFC.isBarcodeErrorDisplayed()).toBe(false);

        // On vérifie que les infos sont bien récupérés
        expect(AFC.getItemDetailsName()).toEqual('Coca-Cola');
        expect(AFC.getItemDetailsNamePlural()).toEqual('Coca-Cola');
        expect(AFC.getItemDetailsContainer()).toEqual('Canette');
        expect(AFC.getItemDetailsContainerPlural()).toEqual('Canettes');
        expect(AFC.getItemDetailsUnit()).toEqual('cl');
        expect(AFC.getItemDetailsContainerQty()).toEqual('33');

        // On vérifie qu'on ne peut pas les modifier
        expect(AFC.isItemDetailsNameEnabled()).toBe(false);
        expect(AFC.isItemDetailsContainerEnabled()).toBe(false);
        expect(AFC.isItemDetailsContainerPluralEnabled()).toBe(false);
        expect(AFC.isItemDetailsUnitEnabled()).toBe(false);
        expect(AFC.isItemDetailsContainerQtyEnabled()).toBe(false);
        // expect(AFC.isPackChoiceEnabled()).toBe(false);

        expect(AFC.getItemDetailsPreview()).toEqual('Appro de 4 Canettes de 33 cl de Coca-Cola');

        // Les champs doivent être pré-remplis à partir des informations de l'ItemDetails
        expect(AFC.getSellItemName()).toEqual('Coca-Cola');
        expect(AFC.getSellItemNamePlural()).toEqual('Coca-Cola');
        expect(AFC.getSellItemUnitName()).toEqual('cl');
        expect(AFC.getSellItemUnitNamePlural()).toEqual('cl');
        expect(AFC.getStockItemSellToBuy()).toEqual('33');

        // On modifie ces champs
        AFC.setSellItemUnitName('canette', true);
        AFC.setSellItemUnitNamePlural('s');
        AFC.setStockItemSellToBuy('1', true);

        AFC.setPrice('0.5');

        expect(AFC.getSellItemPreview()).toEqual('Achat de 53 canettes de Coca-Cola pour 31,80 €');

        AFC.clickValidate();

        expect(AFC.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        AFC.closeLastAlert();
    });

    it('should create a pack existing in an other bar, for an existing item in the current bar', function() {
        // Code barre existant en aviron jone
        AFC.setBarcode('1234567890');
        expect(AFC.isBarcodeErrorDisplayed()).toBe(false);

        expect(AFC.getBuyItemQty()).toEqual('10');
        expect(AFC.getItemInPack()).toEqual('Coca-Cola');
        AFC.setPrice('4');

        AFC.clickValidate();

        expect(AFC.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        AFC.closeLastAlert();
    });

    it('should create a pack existing in an other bar and the corresponding item', function() {
        AFC.setBarcode('123456789');
        expect(AFC.isBarcodeErrorDisplayed()).toBe(false);

        // On vérifie que les infos sont bien récupérés
        expect(AFC.getItemDetailsName()).toEqual('Coca-Cola Light');
        expect(AFC.getItemDetailsNamePlural()).toEqual('Coca-Cola Light');
        expect(AFC.getItemDetailsContainer()).toEqual('Canette');
        expect(AFC.getItemDetailsContainerPlural()).toEqual('Canettes');
        expect(AFC.getItemDetailsUnit()).toEqual('cl');
        expect(AFC.getItemDetailsContainerQty()).toEqual('33');

        // On vérifie qu'on ne peut pas les modifier
        expect(AFC.isItemDetailsNameEnabled()).toBe(false);
        expect(AFC.isItemDetailsContainerEnabled()).toBe(false);
        expect(AFC.isItemDetailsContainerPluralEnabled()).toBe(false);
        expect(AFC.isItemDetailsUnitEnabled()).toBe(false);
        expect(AFC.isItemDetailsContainerQtyEnabled()).toBe(false);
        // expect(AFC.isPackChoiceEnabled()).toBe(false);

        expect(AFC.getItemDetailsPreview()).toEqual('Appro de 4 Canettes de 33 cl de Coca-Cola Light');

        // Les champs doivent être pré-remplis à partir des informations de l'ItemDetails
        expect(AFC.getSellItemName()).toEqual('Coca-Cola Light');
        expect(AFC.getSellItemNamePlural()).toEqual('Coca-Cola Light');
        expect(AFC.getSellItemUnitName()).toEqual('cl');
        expect(AFC.getSellItemUnitNamePlural()).toEqual('cl');
        expect(AFC.getStockItemSellToBuy()).toEqual('33');

        // On va le rattacher au Coca existant
        AFC.clickAlreadySell();
        AFC.setOldSellItem('Coc');
        expect(AFC.getOldSellItem()).toEqual('Coca-Cola');
        AFC.setStockItemSellToBuy('1', true);
        AFC.setPrice('0.6');
        expect(AFC.getSellItemPreview()).toEqual('Achat de 53 canettes de Coca-Cola pour 38,16 €');

        AFC.clickValidate();
        // browser.pause();
        expect(AFC.getBuyItemQty()).toEqual('10');
        expect(AFC.getItemInPack()).toEqual('Coca-Cola Light');

        AFC.setPrice('5');
        AFC.clickValidate();

        expect(AFC.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        AFC.closeLastAlert();
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

        barsBarPage.changeToBar('Aviron Jône');
    });
});
