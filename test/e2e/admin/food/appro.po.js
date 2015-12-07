var AdminFoodAppro = function() {
    var ePrice = element(by.binding("appro.totalPrice | currency"));
    var eSearch = element(by.model('appro.itemToAdd'));
    var bValidate = element(by.buttonText("Valider l'appro"));

    this.go = function() {
        element(by.partialLinkText('Administration')).click();
        element(by.id('admin-food')).click();
        element(by.linkText('Faire une appro')).click();
    };

    this.getPrice = function() {
        return ePrice.getText();
    };
    this.setSearch = function(text) {
        return eSearch.sendKeys(text).sendKeys(protractor.Key.TAB);
    };
    this.getRow = function(i) {
        return element(by.repeater("(i, item) in appro.itemsList | orderBy:'nb':true | filter:filterItemsl").row(i));
    };
    this.getRowText = function(i) {
        return this.getRow(i).getText();
    };
    this.validate = function() {
        return bValidate.click();
    };

};
module.exports = AdminFoodAppro;
