var UserCreation = require('./account.po.js');

describe('UserCreation', function() {
    var userCreation = new UserCreation();

    it('should create a new user without errors', function() {
        userCreation.go();

        expect(userCreation.errorMessage.toEqual());

        // element(by.linkText('Coca-Cola')).click();
        // element(by.linkText('Canette de 33 cl de Coca-Cola')).click();

        // expect(adminFoodInventory.getPrice()).toEqual("0,50 €");
        // adminFoodInventory.changeLastItemQty("0"); // Comme de base il y a 1 dans le champ, là on rajoute simplement un 0 ce qui fait donc 10
        // expect(adminFoodInventory.getPrice()).toEqual("5,00 €");

        // element(by.linkText('Canette de 33 cl de Coca-Cola Light')).click();
        // expect(adminFoodInventory.getPrice()).toEqual("5,60 €");
        // adminFoodInventory.changeLastItemQty("5"); // Là la quantité passe à 15
        // expect(adminFoodInventory.getPrice()).toEqual("14,00 €");

        // adminFoodInventory.clickValidate();
        // expect(adminFoodInventory.getPrice()).toEqual("0,00 €");
    });
});
