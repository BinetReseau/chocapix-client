var FoodDetails = function() {

    this.getTitle = function() {
        return element(by.css('.text-center.no-vertical-margin')).getText();
    };
    this.getPrice = function() {
        return element(by.id('food-details-price')).getText();
    };
    this.getStock = function() {
        return element(by.id('food-details-stock')).getText();
    };

    this.goStocks = function() {
        return element(by.id('food-tab-stocks')).click();
    };
    this.goInfos = function() {
        return element(by.id('food-tab-infos')).click();
    };
    this.goEdition = function() {
        return element(by.id('food-tab-edition')).click();
    };

    // Edition tab
    this.setSellItemName = function(text) {
        return element(by.model('newFood_item.name'))
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.NULL)
            .sendKeys(protractor.Key.BACK_SPACE)
            .sendKeys(text);
    };
    this.setSellItemNamePlural = function(text) {
        return element(by.model('newFood_item.name_plural'))
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.NULL)
            .sendKeys(protractor.Key.BACK_SPACE)
            .sendKeys(text);
    };
    this.setSellItemUnit = function(text) {
        return element(by.model('newFood_item.unit_name'))
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.NULL)
            .sendKeys(protractor.Key.BACK_SPACE)
            .sendKeys(text);
    };
    this.setSellItemUnitPlural = function(text) {
        return element(by.model('newFood_item.unit_name_plural'))
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.NULL)
            .sendKeys(protractor.Key.BACK_SPACE)
            .sendKeys(text);
    };
    this.setSellItemUnitFactor = function(text) {
        return element(by.model('newFood_item.unit_factor'))
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.NULL)
            .sendKeys(protractor.Key.BACK_SPACE)
            .sendKeys(text);
    };
    this.setSellItemTax = function(text) {
        return element(by.model('newFood_item.tax'))
            .sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.NULL)
            .sendKeys(protractor.Key.BACK_SPACE)
            .sendKeys(text);
    };
    this.validateEdition = function() {
        return element(by.id('food-details-edition-validate')).click();
    };
};
module.exports = FoodDetails;
