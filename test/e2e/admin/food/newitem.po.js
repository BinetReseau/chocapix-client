var BarsAdminFoodCreationPage = function() {
    var eBarcode = element(by.model('data.barcode'));
    var eItemDetailsName = element(by.model('data.id_name'));
    var eItemDetailsContainer = element(by.model('data.id_container'));
    var eItemDetailsContainerPlural = element(by.model('data.id_container_plural'));
    var eItemDetailsUnit = element(by.model('data.id_unit'));
    var eItemDetailsContainerQty = element(by.model('data.id_container_qty'));
    var eSellItemName = element(by.model('data.sei_name'));
    var eSellItemUnitName = element(by.model('data.sei_unit_name'));
    var eSellItemUnitNamePlural = element(by.model('data.sei_unit_name_plural'));
    var eStockItemSellToBuy = element(by.model('data.sti_sell_to_buy'));
    var eBuyItemPricePrices = element.all(by.model('data.bip_price'));
    var eOldSellItem = element(by.model('oldSellItem'));

    var eItemDetailsPreview = element(by.id('admin-food-id-preview'));
    var eSellItemPreview = element(by.id('admin-food-sei-preview'));

    var fPrice = function() {
        return eBuyItemPricePrices.filter(function(elem) {
           return elem.isDisplayed();
        });
    };
    var fLastAlert = function() {
        return element(by.repeater('alert in alerts').row(0));
    }

    this.go = function() {
        element(by.partialLinkText('Administration')).click();
        element(by.id('admin-food')).click();
        element(by.linkText('Ajouter un aliment')).click();
    };
    this.clickAlreadySell = function() {
        element(by.linkText('Rattacher à un aliment déjà vendu')).click();
    };
    this.clickValidate = function() {
        element(by.buttonText('Ajouter')).click();
    };

    this.getItemDetailsPreview = function() {
        return eItemDetailsPreview.getText();
    };
    this.getSellItemPreview = function() {
        return eSellItemPreview.getText();
    };

    this.setOldSellItem = function(text) {
        return eOldSellItem.sendKeys(text).sendKeys(protractor.Key.ENTER);
    };
    this.getOldSellItem = function() {
        return eOldSellItem.getAttribute('value');
    };
    this.setPrice = function(text) {
        return fPrice().sendKeys(text);
    };
    this.getLastAlert = function() {
        return fLastAlert().getText();
    };
    this.getBarcode = function() {
        return eBarcode.getAttribute('value');
    };
    this.setBarcode = function(text) {
        return eBarcode.sendKeys(text);
    };
    this.getItemDetailsName = function() {
        return eItemDetailsName.getAttribute('value');
    };
    this.setItemDetailsName = function(text) {
        return eItemDetailsName.sendKeys(text);
    };
    this.getItemDetailsContainer = function() {
        return eItemDetailsContainer.getAttribute('value');
    };
    this.setItemDetailsContainer = function(text) {
        return eItemDetailsContainer.sendKeys(text);
    };
    this.getItemDetailsContainerPlural = function() {
        return eItemDetailsContainerPlural.getAttribute('value');
    };
    this.setItemDetailsContainerPlural = function(text) {
        return eItemDetailsContainerPlural.sendKeys(text);
    };
    this.getItemDetailsUnit = function() {
        return eItemDetailsUnit.getAttribute('value');
    };
    this.setItemDetailsUnit = function(text) {
        return eItemDetailsUnit.sendKeys(text);
    };
    this.getItemDetailsContainerQty = function() {
        return eItemDetailsContainerQty.getAttribute('value');
    };
    this.setItemDetailsContainerQty = function(text) {
        return eItemDetailsContainerQty.sendKeys(text);
    };
    this.getSellItemName = function() {
        return eSellItemName.getAttribute('value');
    };
    this.setSellItemName = function(text) {
        return eSellItemName.sendKeys(text);
    };
    this.getSellItemUnitName = function() {
        return eSellItemUnitName.getAttribute('value');
    };
    this.setSellItemUnitName = function(text) {
        return eSellItemUnitName.sendKeys(text);
    };
    this.getSellItemUnitNamePlural = function() {
        return eSellItemUnitNamePlural.getAttribute('value');
    };
    this.setSellItemUnitNamePlural = function(text) {
        return eSellItemUnitNamePlural.sendKeys(text);
    };
    this.getStockItemSellToBuy = function() {
        return eStockItemSellToBuy.getAttribute('value');
    };
    this.setStockItemSellToBuy = function(text) {
        return eStockItemSellToBuy.sendKeys(text);
    };
    this.getBuyItemPricePrices = function() {
        return eBuyItemPricePrices.getAttribute('value');
    };
    this.setBuyItemPricePrices = function(text) {
        return eBuyItemPricePrices.sendKeys(text);
    };
};
module.exports = BarsAdminFoodCreationPage;
