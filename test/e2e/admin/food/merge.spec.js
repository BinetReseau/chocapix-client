var Merge = require('./merge.po.js');
var AdminFoodCreation = require('./newitem.po.js');
var FoodList = require('../../food/list.food.po.js');
var BarsBarPage = require('../../bar/bar.po.js');
var AdminFoodAppro = require('./appro.po.js');
var FoodDetails = require('../../food/details.food.po.js');

describe('Food creation', function() {
    var merge = new Merge();
    var AFC = new AdminFoodCreation();
    var appro = new AdminFoodAppro();
    var FL = new FoodList();
    var bar = new BarsBarPage();
    var FD = new FoodDetails();

    it('should create new items to merge', function() {
        // premier aliment
        AFC.go();

        AFC.setBarcode('88880');
        expect(AFC.isBarcodeErrorDisplayed()).toBe(false);
        AFC.setItemDetailsName('Penne Rigate');
        AFC.setItemDetailsContainer('Paquet');
        AFC.setItemDetailsContainerPlural('s');
        AFC.setItemDetailsUnit('g');
        AFC.setItemDetailsContainerQty('500');

        expect(AFC.getItemDetailsPreview()).toEqual('Appro de 4 Paquets de 500 g de Penne Rigate');

        AFC.setSellItemName('Penne Rigate');
        AFC.setSellItemUnitName('g');
        AFC.setStockItemSellToBuy('500');
        AFC.setPrice('2.12');

        expect(AFC.getSellItemPreview()).toEqual('Achat de 53 g de Penne Rigate pour 0,27 €');

        AFC.clickValidate();
        expect(AFC.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        AFC.closeLastAlert();

        // deuxième aliment
        AFC.go();

        AFC.setBarcode('88880');
        expect(AFC.isBarcodeErrorDisplayed()).toBe(true);
        AFC.setBarcode('88881');
        expect(AFC.isBarcodeErrorDisplayed()).toBe(false);
        AFC.setItemDetailsName('Tortellini');
        AFC.setItemDetailsContainer('Paquet');
        AFC.setItemDetailsContainerPlural('s');
        AFC.setItemDetailsUnit('g');
        AFC.setItemDetailsContainerQty('1000');

        expect(AFC.getItemDetailsPreview()).toEqual('Appro de 4 Paquets de 1000 g de Tortellini');

        AFC.setSellItemName('Tortellini');
        AFC.setSellItemUnitName('g');
        AFC.setStockItemSellToBuy('1000');
        AFC.setPrice('3.28');

        expect(AFC.getSellItemPreview()).toEqual('Achat de 53 g de Tortellini pour 0,21 €');

        AFC.clickValidate();
        expect(AFC.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        AFC.closeLastAlert();

        // troisième aliment
        AFC.go();

        AFC.setBarcode('88881');
        expect(AFC.isBarcodeErrorDisplayed()).toBe(true);
        AFC.setBarcode('88882');
        expect(AFC.isBarcodeErrorDisplayed()).toBe(false);
        AFC.setItemDetailsName('Pippe Rigate');
        AFC.setItemDetailsContainer('Paquet');
        AFC.setItemDetailsContainerPlural('s');
        AFC.setItemDetailsUnit('kg');
        AFC.setItemDetailsContainerQty('1');

        expect(AFC.getItemDetailsPreview()).toEqual('Appro de 4 Paquets de 1 kg de Pippe Rigate');

        AFC.setSellItemName('Pippe Rigate');
        AFC.setSellItemUnitName('kg');
        AFC.setStockItemSellToBuy('1');
        AFC.setPrice('5');

        expect(AFC.getSellItemPreview()).toEqual('Achat de 53 kg de Pippe Rigate pour 318,00 €');

        AFC.clickValidate();
        expect(AFC.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
        AFC.closeLastAlert();

    });

    it('should verify the food is correctly created using the magic bar', function () {
        bar.setMagicBarText('tort 53');
        expect(bar.getTypeAhead('Acheter', 0).getText()).toBe('Acheter 53 g de Tortellini pour 0,21 €');
        bar.setMagicBarText('penn 53');
        expect(bar.getTypeAhead('Acheter', 0).getText()).toBe('Acheter 53 g de Penne Rigate pour 0,27 €');
        bar.setMagicBarText('pipp 53');
        expect(bar.getTypeAhead('Acheter', 0).getText()).toBe('Acheter 53 kg de Pippe Rigate pour 318,00 €');
    });

    it('should add some quantities of the newly created food', function () {
        appro.go()

        appro.setSearch('tort');
        appro.setRowQty(0, 3);

        appro.setSearch('penn');
        appro.setRowQty(0, 10);

        appro.setSearch('pipp');
        appro.setRowQty(0, 5);

        appro.validate();
    });

    it('should merge all the Pasta together', function() {
        merge.go();
        merge.setSellItemName('Pâtes');
        merge.setSellItemUnitName('g');
        merge.setSellItemTax('20');

        merge.setAddSellItem('Tort');
        expect(merge.getSellItemsToMergeProposal('Tort').get(0).getText()).toBe('Tortellini (g)');
        merge.getSellItemsToMergeProposal('Tort').get(0).click();
        expect(merge.getAddSellItem().getText()).toBe('');
        expect(merge.getSellItemToMerge(0).getText()).toMatch(/Tortellini/);

        merge.setAddSellItem('penn');
        expect(merge.getSellItemsToMergeProposal('Penn').get(0).getText()).toBe('Penne Rigate (g)');
        merge.getSellItemsToMergeProposal('Penn').get(0).click();
        expect(merge.getAddSellItem().getText()).toBe('');
        expect(merge.getSellItemToMerge(1).getText()).toMatch(/Penne Rigate/);

        merge.setAddSellItem('Pipp');
        expect(merge.getSellItemsToMergeProposal('Pipp').get(0).getText()).toBe('Pippe Rigate (kg)');
        merge.getSellItemsToMergeProposal('Pipp').get(0).click();
        expect(merge.getAddSellItem().getText()).toBe('');
        expect(merge.getSellItemToMerge(2).getText()).toMatch(/Pippe Rigate/);

        merge.setRowUnitFactor(2, 0.001);

        merge.validate();
    });

    it('should verify that everything is fine in the foodlist', function () {
        FL.go();

        FL.toggleRowByNumber(0);

        expect(FL.getSubRowTextByNumber(0, 1)).toMatch(/Paquet de 500 g de Penne Rigate/);
        expect(FL.getSubRowTextByNumber(0, 1)).toMatch(/5 000 g \(38,462 %\)/);
        expect(FL.getSubRowTextByNumber(0, 1)).toMatch(/0,0051 € \/ g/);
        expect(FL.getSubRowTextByNumber(0, 1)).toMatch(/25,44 € \(38 %\)/);

        expect(FL.getSubRowTextByNumber(0, 2)).toMatch(/Paquet de 1000 g de Tortellini/);
        expect(FL.getSubRowTextByNumber(0, 2)).toMatch(/3 000 g \(23,077 %\)/);
        expect(FL.getSubRowTextByNumber(0, 2)).toMatch(/0,0039 € \/ g/);
        expect(FL.getSubRowTextByNumber(0, 2)).toMatch(/11,81 € \(18 %\)/);

        expect(FL.getSubRowTextByNumber(0, 3)).toMatch(/Paquet de 1 kg de Pippe Rigate/);
        expect(FL.getSubRowTextByNumber(0, 3)).toMatch(/5 000 g \(38,462 %\)/);
        expect(FL.getSubRowTextByNumber(0, 3)).toMatch(/0,0060 € \/ g/);
        expect(FL.getSubRowTextByNumber(0, 3)).toMatch(/30,00 € \(45 %\)/);

    });

    it('should go to the Pasta page and delete something', function () {
        FL.goFoodByNumber(0);

        FD.goStocks();
        FD.deleteStockItem(2);
        expect(FD.getRow(0).getText()).toMatch(/Paquet de 500 g de Penne Rigate/);
        expect(FD.getRow(1).getText()).toMatch(/Paquet de 1000 g de Tortellini/);
        expect(FD.getNumberOfStockItems()).toBe(2);


    });

});
