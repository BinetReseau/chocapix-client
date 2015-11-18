var BarsAdminFoodCreationPage = require('./newitem.po.js');

describe('Food creation', function() {
    var barsAdminFoodCreationPage = new BarsAdminFoodCreationPage();

    it('should create a simple item', function() {
        // Création d'un aliment
        barsAdminFoodCreationPage.go();

        barsAdminFoodCreationPage.setBarcode('123');
        barsAdminFoodCreationPage.setItemDetailsName('Coca-Cola');
        barsAdminFoodCreationPage.setItemDetailsContainer('Canette');
        barsAdminFoodCreationPage.setItemDetailsContainerPlural('s');
        barsAdminFoodCreationPage.setItemDetailsUnit('cl');
        barsAdminFoodCreationPage.setItemDetailsContainerQty('33');

        expect(barsAdminFoodCreationPage.getItemDetailsPreview()).toEqual('Appro de 4 Canettes de 33 cl de Coca-Cola');

        barsAdminFoodCreationPage.setSellItemName('Coca-Cola');
        barsAdminFoodCreationPage.setSellItemUnitName('canette');
        barsAdminFoodCreationPage.setSellItemUnitNamePlural('s');
        barsAdminFoodCreationPage.setStockItemSellToBuy('1');
        barsAdminFoodCreationPage.setPrice('0.5');

        expect(barsAdminFoodCreationPage.getSellItemPreview()).toEqual('Achat de 53 canettes de Coca-Cola pour 31,80 €');

        barsAdminFoodCreationPage.clickValidate();

        expect(barsAdminFoodCreationPage.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
    });

    it('should create a new item rattached to an existed SellItem', function() {
        barsAdminFoodCreationPage.setBarcode('123456');
        barsAdminFoodCreationPage.setItemDetailsName('Coca-Cola Light');
        barsAdminFoodCreationPage.setItemDetailsContainer('Canette');
        barsAdminFoodCreationPage.setItemDetailsContainerPlural('s');
        barsAdminFoodCreationPage.setItemDetailsUnit('cl');
        barsAdminFoodCreationPage.setItemDetailsContainerQty('33');

        expect(barsAdminFoodCreationPage.getItemDetailsPreview()).toEqual('Appro de 4 Canettes de 33 cl de Coca-Cola Light');

        barsAdminFoodCreationPage.clickAlreadySell();

        barsAdminFoodCreationPage.setOldSellItem('Coc');
        expect(barsAdminFoodCreationPage.getOldSellItem()).toEqual('Coca-Cola');

        barsAdminFoodCreationPage.setStockItemSellToBuy('1');
        barsAdminFoodCreationPage.setPrice('0.6');

        expect(barsAdminFoodCreationPage.getSellItemPreview()).toEqual('Achat de 53 canettes de Coca-Cola pour 38,16 €');

        barsAdminFoodCreationPage.clickValidate();

        expect(barsAdminFoodCreationPage.getLastAlert()).toMatch(/L'aliment a été correctement créé\./);
    });

    // it('Should inventory the item', function() {
    //     // Inventaire de l'aliment créé
    //     element(by.id('admin-food')).click();
    //     element(by.linkText('Faire un inventaire')).click();
    //
    //     element(by.linkText('Coca-Cola')).click();
    //     element(by.linkText('Canette de 33 cl de Coca-Cola')).click();
    //     expect(element(by.binding("inventory.totalPrice | currency")).getText()).toEqual("0,50 €");
    //     element(by.buttonText("Valider l'inventaire")).click();
    //     expect(element(by.binding("inventory.totalPrice | currency")).getText()).toEqual("0,00 €");
    //
    //     // Appro de l'aliment
    //     element(by.id('admin-food')).click();
    //     element(by.linkText('Faire une appro')).click();
    //
    //     expect(element(by.binding("appro.totalPrice | currency")).getText()).toEqual("0,00 €");
    //
    //     element(by.model('appro.itemToAdd')).sendKeys('123').sendKeys(protractor.Key.TAB);
    //
    //     expect(element(by.repeater("(i, item) in appro.itemsList | orderBy:'nb':true | filter:filterItemsl").row(0)).getText()).toMatch(/1 Canette de 33 cl de Coca-Cola/);
    //     expect(element(by.binding("appro.totalPrice | currency")).getText()).toEqual("0,50 €");
    //
    //     element(by.buttonText("Valider l'appro")).click();
    //
    //     expect(element(by.binding("appro.totalPrice | currency")).getText()).toEqual("0,00 €");
    //
    //     // Vérification de l'aliment créé
    //     element(by.partialLinkText('Aliments')).click();
    //     expect(element(by.repeater("f in food_list | filter:filterItems | orderBy:list_order:reverse | limitTo: limit.nb track by f.id").row(1)).getText()).toMatch(/Coca-Cola/);
    //     expect(element(by.repeater("f in food_list | filter:filterItems | orderBy:list_order:reverse | limitTo: limit.nb track by f.id").row(1)).getText()).toMatch(/2 canettes/);
    //     expect(element(by.repeater("f in food_list | filter:filterItems | orderBy:list_order:reverse | limitTo: limit.nb track by f.id").row(1)).getText()).toMatch(/0,60 € \/ canette/);
    //     expect(element(by.repeater("f in food_list | filter:filterItems | orderBy:list_order:reverse | limitTo: limit.nb track by f.id").row(1)).getText()).toMatch(/1,20 €/);
    // });
});
