var AdminFoodCreation = function() {
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
    var eOldSellItem = element(by.model('data.oldSellItem'));
    var eItemInPack = element(by.model('data.itemInPack'));
    var eBuyItemQty = element.all(by.model('data.bi_itemqty'));
    var eBarcodeError = element(by.id('admin-food-barcode-error'));

    var eItemDetailsPreview = element(by.id('admin-food-id-preview'));
    var eSellItemPreview = element(by.id('admin-food-sei-preview'));

    var bValidate = element(by.buttonText('Ajouter'));
    var bIsPack = element(by.linkText("Il s'agit d'un pack"));
    var bIsNotPack = element(by.linkText("Il s'agit d'un aliment normal"));
    var bAlreadySell = element(by.linkText('Rattacher à un aliment déjà vendu'));
    var bNotYetSell = element(by.linkText('Le bar ne vend pas encore cet aliment'));

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
    this.clickPack = function() {
        bIsPack.click();
    };
    this.clickAlreadySell = function() {
        bAlreadySell.click();
    };
    this.clickValidate = function() {
        bValidate.click();
    };

    this.getItemDetailsPreview = function() {
        return eItemDetailsPreview.getText();
    };
    this.getSellItemPreview = function() {
        return eSellItemPreview.getText();
    };

    this.isPackChoiceEnabled = function() {
        return bIsPack.getAttribute('class').then(function (name) {
            return !/disabled/.test(name);
        });
    };
    this.isNotPackChoiceEnabled = function() {
        return bIsNotPack.getAttribute('class').then(function (name) {
            return !/disabled/.test(name);
        });
    };
    this.isAlreadySellChoiceEnabled = function() {
        return bAlreadySell.getAttribute('class').then(function (name) {
            return !/disabled/.test(name);
        });
    };
    this.isNotYetSellChoiceEnabled = function() {
        return bNotYetSell.getAttribute('class').then(function (name) {
            return !/disabled/.test(name);
        });
    };
    this.isValidateEnabled = function() {
        return bValidate.getAttribute('class').then(function (name) {
            return !/disabled/.test(name);
        });
    };
    this.isBarcodeErrorDisplayed = function() {
        return eBarcodeError.isPresent();
    };
    this.setItemInPack = function(text) {
        return eItemInPack.sendKeys(text).sendKeys(protractor.Key.ENTER);
    };
    this.getItemInPack = function() {
        return eItemInPack.getAttribute('value');
    };
    this.isItemInPackEnabled = function() {
        return eItemInPack.isEnabled();
    };
    this.setOldSellItem = function(text) {
        return eOldSellItem.sendKeys(text).sendKeys(protractor.Key.ENTER);
    };
    this.getOldSellItem = function() {
        return eOldSellItem.getAttribute('value');
    };
    this.isOldSellItemEnabled = function() {
        return eOldSellItem.isEnabled();
    };
    this.setPrice = function(text) {
        return fPrice().sendKeys(text);
    };
    this.getLastAlert = function() {
        return fLastAlert().getText();
    };
    this.closeLastAlert = function() {
        return element(by.partialButtonText('Close')).click();
    };
    this.getBuyItemQty = function() {
        return eBuyItemQty.getAttribute('value');
    };
    this.isBuyItemQtyEnabled = function() {
        return eBuyItemQty.first().isEnabled();
    };
    this.setBuyItemQty = function(text) {
        return eBuyItemQty.sendKeys(text);
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
    this.isItemDetailsNameEnabled = function() {
        return eItemDetailsName.isEnabled();
    };
    this.setItemDetailsName = function(text) {
        return eItemDetailsName.sendKeys(text);
    };
    this.getItemDetailsContainer = function() {
        return eItemDetailsContainer.getAttribute('value');
    };
    this.isItemDetailsContainerEnabled = function() {
        return eItemDetailsContainer.isEnabled();
    };
    this.setItemDetailsContainer = function(text) {
        return eItemDetailsContainer.sendKeys(text);
    };
    this.getItemDetailsContainerPlural = function() {
        return eItemDetailsContainerPlural.getAttribute('value');
    };
    this.isItemDetailsContainerPluralEnabled = function() {
        return eItemDetailsContainerPlural.isEnabled();
    };
    this.setItemDetailsContainerPlural = function(text) {
        return eItemDetailsContainerPlural.sendKeys(text);
    };
    this.getItemDetailsUnit = function() {
        return eItemDetailsUnit.getAttribute('value');
    };
    this.isItemDetailsUnitEnabled = function() {
        return eItemDetailsUnit.isEnabled();
    };
    this.setItemDetailsUnit = function(text) {
        return eItemDetailsUnit.sendKeys(text);
    };
    this.getItemDetailsContainerQty = function() {
        return eItemDetailsContainerQty.getAttribute('value');
    };
    this.isItemDetailsContainerQtyEnabled = function() {
        return eItemDetailsContainerQty.isEnabled();
    };
    this.setItemDetailsContainerQty = function(text) {
        return eItemDetailsContainerQty.sendKeys(text);
    };
    this.getSellItemName = function() {
        return eSellItemName.getAttribute('value');
    };
    this.isSellItemNameEnabled = function() {
        return eSellItemName.isEnabled();
    };
    this.setSellItemName = function(text) {
        return eSellItemName.sendKeys(text);
    };
    this.getSellItemUnitName = function() {
        return eSellItemUnitName.getAttribute('value');
    };
    this.isSellItemUnitNameEnabled = function() {
        return eSellItemUnitName.isEnabled();
    };
    this.setSellItemUnitName = function(text) {
        return eSellItemUnitName.sendKeys(text);
    };
    this.getSellItemUnitNamePlural = function() {
        return eSellItemUnitNamePlural.getAttribute('value');
    };
    this.isSellItemUnitNamePluralEnabled = function() {
        return eSellItemUnitNamePlural.isEnabled();
    };
    this.setSellItemUnitNamePlural = function(text) {
        return eSellItemUnitNamePlural.sendKeys(text);
    };
    this.getStockItemSellToBuy = function() {
        return eStockItemSellToBuy.getAttribute('value');
    };
    this.isStockItemSellToBuyEnabled = function() {
        return eStockItemSellToBuy.isEnabled();
    };
    this.setStockItemSellToBuy = function(text) {
        return eStockItemSellToBuy.sendKeys(text);
    };
    this.getBuyItemPricePrices = function() {
        return eBuyItemPricePrices.getAttribute('value');
    };
    this.isBuyItemPricePricesEnabled = function() {
        return eBuyItemPricePrices.isEnabled();
    };
    this.setBuyItemPricePrices = function(text) {
        return eBuyItemPricePrices.sendKeys(text);
    };
};
module.exports = AdminFoodCreation;
