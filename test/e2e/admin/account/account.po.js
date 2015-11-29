var UserCreation = function() {
	// var ePrice = element(by.binding("inventory.totalPrice | currency"));
	// var bValidate = element(by.buttonText("Valider l'inventaire"));
	// var eBarcode = element(by.model('barcodei'));
	var errorMessage = element(by.id('fail-creation'));

	var importUsername = element(by.id('aowner'));
	var importSolde = element(by.id('amoney-import'));
	var importBTN = element(by.id('validate-importation'));

	var lastName = element(by.id('ulastname'));
	var firstName = element(by.id('ufirstname'));
	var email = element(by.id('uemail'));
	var emailDiv = element(by.id("email-div"));
	var pseudo = element(by.id('upseudo'));
	var login = element(by.id('uusername'));
	var loginDiv = element(by.id("uusername-div"));
	var password = element(by.id('upassword'));
	var passwordBis = element(by.id('upasswordBis'));
	var passwordDiv = element(by.id('upassword-div'));
	var createSolde = element(by.id('amoney-create'));
	var createBTN = element(by.id('validate-creation'));



	this.go = function() {
		element(by.partialLinkText('Administration')).click();
        element(by.id('admin-user')).click();
        element(by.linkText('Créer un compte')).click();
	};

	this.isErrorMessagePresent = function() {
		return errorMessage.isPresent();
	};

	this.setImportUsername = function(entry) {
		return importUsername.sendKeys(entry);
	};
	this.setImportSolde = function(entry) {
		return importSolde.sendKeys(entry);
	};

	this.getImportBTNClass = function() {
		return importBTN.getAttribute("class");
	};

	this.setLastName = function(entry) {
		return lastName.sendKeys(entry);
	};
	this.setFirstName = function(entry) {
		return firstName.sendKeys(entry);
	};
	this.setEmail = function(entry) {
		return email.sendKeys(entry);
	};
	this.setPseudo = function(entry) {
		return pseudo.sendKeys(entry);
	};
	this.setLogin = function(entry) {
		return login
		.sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.NULL)
        .sendKeys(protractor.Key.BACK_SPACE)
		.sendKeys(entry);
	};
	this.setPassword = function(entry) {
		return password.sendKeys(entry);
	};
	this.setPasswordBis = function(entry) {
		return passwordBis
		.sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.NULL)
        .sendKeys(protractor.Key.BACK_SPACE)
		.sendKeys(entry);
	};
	this.setCreateSolde = function(entry) {
		return createSolde
		.sendKeys(protractor.Key.SHIFT, protractor.Key.ARROW_UP, protractor.Key.NULL)
        .sendKeys(protractor.Key.BACK_SPACE)
		.sendKeys(entry);
	};

	this.getEmailClass = function() {
		return emailDiv.getAttribute("class");
	};
	this.getLoginClass = function() {
		return loginDiv.getAttribute("class");
	};
	this.getPasswordClass = function() {
		return passwordDiv.getAttribute("class");
	};

	this.getCreateBTNClass = function() {
		return createBTN.getAttribute("class");
	};

	this.validateCreation = function() {
		return createBTN.click();
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
module.exports = UserCreation;
