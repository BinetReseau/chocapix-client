var UserCreation = function() {
	// var ePrice = element(by.binding("inventory.totalPrice | currency"));
	// var bValidate = element(by.buttonText("Valider l'inventaire"));
	// var eBarcode = element(by.model('barcodei'));
	var errorMessage = element(by.id('fail-creation');

	this.go = function() {
		element(by.partialLinkText('Administration')).click();
        element(by.id('admin-user')).click();
        element(by.linkText('Créer un compte')).click();
	};

	// this.enterBarcode = function(barcode) {
	// 	return eBarcode.sendKeys(barcode).sendKeys(protractor.Key.ENTER);
	// };
	// this.changeLastItemQty = function(qty) {
	// 	return element.all(by.model('item.qty')).then(function (elements) {
	// 		return elements[0].sendKeys(qty);
	// 	});
	// };
 //    this.removeLastItem = function(qty) {
	// 	return element.all(by.css('a[title="Supprimer de l\'appro cet aliment"]')).then(function (elements) {
	// 		return elements[0].click();
	// 	});
	// };
	// this.countItemsInInventory = function(qty) {
	// 	return element.all(by.model('item.qty')).then(function (elements) {
	// 		return elements.length;
	// 	});
	// };
	// this.clickFirstItemOutOfStock = function() {
	// 	return element.all(by.linkText('Épuisé')).then(function (elements) {
	// 		return elements[elements.length-1].click();
	// 	});
	// };
	// this.countItemsNotInInventory = function() {
	// 	return element.all(by.linkText('Épuisé')).then(function (elements) {
	// 		return elements.length;
	// 	});
	// };
	// this.getPrice = function() {
	// 	return ePrice.getText();
	// };
	// this.clickValidate = function() {
	// 	return bValidate.click();
	// };
};
module.exports = AdminFoodInventory;
