var FoodList = require('./list.food.po.js');
var FoodDetails = require('./details.food.po.js');

describe('Food edition', function() {
    var foodList = new FoodList();
    var foodDetails = new FoodDetails();

    it('should verify the food details page', function() {
        foodList.go();
        foodList.goFood(1);

        expect(foodDetails.getTitle()).toBe('Coca-Cola');
        expect(foodDetails.getPrice()).toBe('0,75 € / canette');
        expect(foodDetails.getStock()).toBe('41 canettes');
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
        expect(foodDetails.getPrice()).toBe('0,44 € / petite canette');
        expect(foodDetails.getStock()).toBe('82 petites canettes');
    });

    it('should edit the StockItems prices', function() {
        foodDetails.goStocks();

        foodDetails.editStockItem(0);
        foodDetails.setStockItemPrice(0, '1');
        foodDetails.validateStockItem(0);

        foodDetails.editStockItem(1);
        foodDetails.setStockItemPrice(1, '2');
        foodDetails.validateStockItem(1);

        foodDetails.goInfos();

        expect(foodDetails.getPrice()).toBe('1,13 € / petite canette');
    });

    it('should edit the StockItems ratio', function() {
        foodDetails.goStocks();

        foodDetails.editStockItem(0);
        foodDetails.setStockItemSellToBuy(0, '1');
        foodDetails.validateStockItem(0);

        foodDetails.goInfos();

        expect(foodDetails.getPrice()).toBe('1,40 € / petite canette');
        expect(foodDetails.getStock()).toBe('66 petites canettes');

        foodDetails.goStocks();

        foodDetails.editStockItem(1);
        foodDetails.setStockItemSellToBuy(1, '1');
        foodDetails.validateStockItem(1);

        foodDetails.goInfos();

        expect(foodDetails.getPrice()).toBe('2,25 € / petite canette');
        expect(foodDetails.getStock()).toBe('41 petites canettes');
    });

    it('should re-edit the SellItem', function() {
        foodDetails.goEdition();

        foodDetails.setSellItemName('Coca-Cola');
        foodDetails.setSellItemNamePlural('Coca-Cola');

        foodDetails.setSellItemUnit('canette');
        foodDetails.setSellItemUnitPlural('canettes');

        foodDetails.setSellItemTax('20');

        foodDetails.validateEdition();

        foodDetails.goInfos();

        expect(foodDetails.getTitle()).toBe('Coca-Cola');
        expect(foodDetails.getPrice()).toBe('1,93 € / canette');
        expect(foodDetails.getStock()).toBe('41 canettes');
    });
});
