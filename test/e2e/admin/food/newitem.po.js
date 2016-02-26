var AdminFoodCreation = function() {
    var eBarcode = element.all(by.model('data.barcode')).filter(function(e) { return e.isDisplayed(); }).first();
    var eItemDetailsName = element.all(by.model('data.id_name')).filter(function(e) { return e.isDisplayed(); }).first();
    var eItemDetailsNamePlural = element.all(by.model('data.id_name_plural')).filter(function(e) { return e.isDisplayed(); }).first();
    var eItemDetailsContainer = element.all(by.model('data.id_container')).filter(function(e) { return e.isDisplayed(); }).first();
    var eItemDetailsContainerPlural = element.all(by.model('data.id_container_plural')).filter(function(e) { return e.isDisplayed(); }).first();
    var eItemDetailsUnit = element.all(by.model('data.id_unit')).filter(function(e) { return e.isDisplayed(); }).first();
    var eItemDetailsContainerQty = element.all(by.model('data.id_container_qty')).filter(function(e) { return e.isDisplayed(); }).first();
    var eSellItemName = element.all(by.model('data.sei_name')).filter(function(e) { return e.isDisplayed(); }).first();
    var eSellItemNamePlural = element.all(by.model('data.sei_name_plural')).filter(function(e) { return e.isDisplayed(); }).first();
    var eSellItemUnitName = element.all(by.model('data.sei_unit_name')).filter(function(e) { return e.isDisplayed(); }).first();
    var eSellItemUnitNamePlural = element.all(by.model('data.sei_unit_name_plural')).filter(function(e) { return e.isDisplayed(); }).first();
    var eStockItemSellToBuy = element.all(by.model('data.sti_sell_to_buy')).filter(function(e) { return e.isDisplayed(); }).first();
    var eBuyItemPricePrices = element.all(by.model('data.bip_price'));
    var eOldSellItem = element.all(by.model('data.oldSellItem')).filter(function(e) { return e.isDisplayed(); }).first();
    var eItemInPack = element.all(by.model('data.itemInPack')).filter(function(e) { return e.isDisplayed(); }).first();
    var eBuyItemQty = element.all(by.model('data.bi_itemqty')).filter(function(e) { return e.isDisplayed(); }).first();
    var eBarcodeError = element(by.id('admin-food-barcode-error'));

    var eItemDetailsPreview = element.all(by.id('admin-food-id-preview')).filter(function(e) { return e.isDisplayed(); }).first();
    var eSellItemPreview = element.all(by.id('admin-food-sei-preview')).filter(function(e) { return e.isDisplayed(); }).first();

    var bValidate = element.all(by.buttonText('Ajouter')).filter(function(e) { return e.isDisplayed(); }).last();
    var bIsPack = element.all(by.linkText("Il s'agit d'un pack")).filter(function(e) { return e.isDisplayed(); }).last();
    var bIsNotPack = element.all(by.linkText("Il s'agit d'un aliment normal")).filter(function(e) { return e.isDisplayed(); }).last();
    var bAlreadySell = element.all(by.linkText('Rattacher à un aliment déjà vendu')).filter(function(e) { return e.isDisplayed(); }).last();
    var bNotYetSell = element.all(by.linkText('Le bar ne vend pas encore cet aliment')).filter(function(e) { return e.isDisplayed(); }).last();

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
        return eBuyItemQty.isEnabled();
    };
    this.setBuyItemQty = function(text) {
        return eBuyItemQty.sendKeys(text);
    };
    this.getBarcode = function() {
        return eBarcode.getAttribute('value');
    };
    this.setBarcode = function(text) {
        return eBarcode
            .sendKeys(protractor.Key.SHIFT, protractor.Key.HOME, protractor.Key.NULL)
            .sendKeys(protractor.Key.BACK_SPACE)
            .sendKeys(text)
            .sendKeys(protractor.Key.ENTER);
    };
    this.getItemDetailsName = function() {
        return eItemDetailsName.getAttribute('value');
    };
    this.getItemDetailsNamePlural = function() {
        return eItemDetailsNamePlural.getAttribute('value');
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
    this.getSellItemNamePlural = function() {
        return eSellItemNamePlural.getAttribute('value');
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
    this.setSellItemUnitName = function(text, erase) {
        if (erase) {
            return eSellItemUnitName
                .sendKeys(protractor.Key.SHIFT, protractor.Key.HOME, protractor.Key.NULL)
                .sendKeys(protractor.Key.BACK_SPACE)
                .sendKeys(text);
        }
        return eSellItemUnitName.sendKeys(text);
    };
    this.getSellItemUnitNamePlural = function() {
        return eSellItemUnitNamePlural.getAttribute('value');
    };
    this.isSellItemUnitNamePluralEnabled = function() {
        return eSellItemUnitNamePlural.isEnabled();
    };
    this.setSellItemUnitNamePlural = function(text, erase) {
        if (erase) {
            return eSellItemUnitNamePlural
                .sendKeys(protractor.Key.SHIFT, protractor.Key.HOME, protractor.Key.NULL)
                .sendKeys(protractor.Key.BACK_SPACE)
                .sendKeys(text);
        }
        return eSellItemUnitNamePlural.sendKeys(text);
    };
    this.getStockItemSellToBuy = function() {
        return eStockItemSellToBuy.getAttribute('value');
    };
    this.isStockItemSellToBuyEnabled = function() {
        return eStockItemSellToBuy.isEnabled();
    };
    this.setStockItemSellToBuy = function(text, erase) {
        if (erase) {
            return eStockItemSellToBuy
                .sendKeys(protractor.Key.SHIFT, protractor.Key.HOME, protractor.Key.NULL)
                .sendKeys(protractor.Key.BACK_SPACE)
                .sendKeys(text);
        }
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
