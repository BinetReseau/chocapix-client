var BarsAdminFoodInventoryPage = function() {
	var ePrice = element(by.binding("inventory.totalPrice | currency"));
	var bValidate = element(by.buttonText("Valider l'inventaire"));

	this.go = function() {
		element(by.partialLinkText('Administration')).click();
        element(by.id('admin-food')).click();
        element(by.linkText('Faire un inventaire')).click();
	};

	this.changeLastItemQty = function(qty) {
		return element.all(by.model('item.qty')).then(function (elements) {
			return elements[0].sendKeys(qty);
		});
	};
	this.getPrice = function() {
		return ePrice.getText();
	};
	this.clickValidate = function() {
		return bValidate.click();
	};
};
module.exports = BarsAdminFoodInventoryPage;
