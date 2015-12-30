var FoodList = require('./list.food.po.js');
var FoodDetails = require('./details.food.po.js');

describe('Food edition', function() {
    var foodList = new FoodList();
    var foodDetails = new FoodDetails();

    it('should verify the food details page', function() {
        foodList.go();
        foodList.goFood(1);

        expect(foodDetails.getTitle()).toBe('Coca-Cola');
        expect(foodDetails.getPrice()).toBe('0,68 € / canette');
        expect(foodDetails.getStock()).toBe('35 canettes');
    });

    it('should edit the SellItem', function() {
        foodDetails.goEdition();

        foodDetails.setSellItemName('Coca Cola');
        foodDetails.setSellItemNamePlural('Coca Cola');

        foodDetails.setSellItemUnit('petite canette');
        foodDetails.setSellItemUnitPlural('petites canettes');

        foodDetails.setSellItemUnitFactor('0.5');

        foodDetails.setSellItemTax('40');

        foodDetails.validateEdition();

        foodDetails.goInfos();

        expect(foodDetails.getTitle()).toBe('Coca Cola');
        expect(foodDetails.getPrice()).toBe('0,39 € / petite canette');
        expect(foodDetails.getStock()).toBe('70 petites canettes');
    });
});
