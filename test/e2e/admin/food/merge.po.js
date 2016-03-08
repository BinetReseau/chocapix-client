var Merge = function() {
    var eSellItemName = element(by.id('sellitemNameInput'));
    var eSellItemPluralName = element(by.id('sellitemPluralnameInput'));
    var eSellItemUnitName = element(by.id('sellitemUnitnameInput'));
    var eSellItemUnitPluralName = element(by.id('sellitemUnitpluralnameInput'));
    var eSellItemTax = element(by.id('sellitemTaxInput'));
    var eAddSellItem = element(by.id('addSellitemInput'));


    this.go = function() {
        element(by.partialLinkText('Administration')).click();
        element(by.id('admin-food')).click();
        element(by.linkText('Regrouper des articles')).click();
    };

    this.setText = function(toChange, text) {
      return toChange
          .sendKeys(protractor.Key.SHIFT, protractor.Key.HOME, protractor.Key.NULL)
          .sendKeys(protractor.Key.BACK_SPACE)
          .sendKeys(text);
    }
    this.setSellItemName = function(text) {
        return this.setText(eSellItemName, text);
    };
    this.setSellItemPluralName = function(text) {
        return this.setText(eSellItemPluralName, text);
    };
    this.setSellItemUnitName = function(text) {
        return this.setText(eSellItemUnitName, text);
    };
    this.setSellItemUnitPluralName = function(text) {
        return this.setText(eSellItemUnitPluralName, text);
    };
    this.setSellItemTax = function(text) {
        return this.setText(eSellItemTax, text);
    };
    this.getAddSellItem = function(text) {
        return eAddSellItem;
    };
    this.setAddSellItem = function(text) {
        return this.setText(eAddSellItem, text);
    };
    this.getSellItemsToMergeProposal = function(text) {
        return element.all(by.partialLinkText(text));
    };
    this.getSellItemToMergeProposal = function(text) {
        return element.all(by.linkText(text));
    };
    this.getSellItemToMerge = function(number) {
        return element.all(by.repeater('(i, item) in sellitems_grp | filter:filterItemsl').row(number));
    };
    this.getRow = function(i) {
        return element(by.repeater("(i, item) in sellitems_grp | filter:filterItemsl").row(i));
    };
    this.setRowUnitFactor = function(i, factor) {
        return this.getRow(i).element(by.model('item.unit_factor'))
            .sendKeys(protractor.Key.SHIFT, protractor.Key.HOME, protractor.Key.NULL)
        		.sendKeys(protractor.Key.BACK_SPACE)
            .sendKeys(factor);
    };
    this.validate = function () {
        return element(by.buttonText('Valider le regroupement')).click();
    };
};
module.exports = Merge;
