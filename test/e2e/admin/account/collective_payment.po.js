var CollectivePayment = function() {
	var validateBTN = element.all(by.className('btn-success')).get(0);
	var amount = element(by.id('aamount'));
	var motive = element(by.id('motive'));


	this.go = function() {
		element(by.partialLinkText('Administration')).click();
        element(by.id('admin-user')).click();
        element(by.linkText('Paiement collectif')).click();
	};

	this.getValidateBTNClass = function() {
		return validateBTN.getAttribute("class");
	};
	this.validatePayment = function() {
		return validateBTN.click();
	}
	this.setMotive = function(entry) {
		return motive.sendKeys(entry);
	};
	this.setAmount = function(entry) {
		return amount
		.sendKeys(protractor.Key.BACK_SPACE, protractor.Key.BACK_SPACE, protractor.Key.BACK_SPACE)
		.sendKeys(entry);
	};
	this.setRatio = function(n, entry) {
    	return element.all(by.model('a.ratio')).get(n)
        .sendKeys(protractor.Key.BACK_SPACE)
		.sendKeys(entry);
    };
    this.getPayPreviewByNumber = function(n) {
    	return element.all(by.binding('a.payPreview | currency')).get(n).getText();
    };
    this.getSoldeByNumber = function(n) {
    	return element.all(by.binding('a.money | currency')).get(n).getText();
    };
	this.getRowByNumber = function(n) {
        return element.all(by.repeater("a in account_list | filter:filterAccounts | orderBy:list_order:reverse")).get(n);
    };
    this.getCheckByNumber = function(n) {
        return element.all(by.model('a.pay')).get(n);
    };
    this.toggleCheckByNumber = function(n) {
    	return element.all(by.model('a.pay')).get(n).click();
    };
    this.getNumberOfRows = function() {
    	return element.all(by.model('a.pay')).then(function(e) { return e.length; });
    };
    this.getNumberOfChecked = function() {
    	return element.all(by.model('a.pay')).filter(function(e) { return e.isSelected(); }).then(function(e) { return e.length; });
    };
    



};
module.exports = CollectivePayment;
