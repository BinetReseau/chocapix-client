var FoodList = require('./list.food.po.js');
var FoodDetails = require('./details.food.po.js');

describe('Food edition', function() {
    var fL = new FoodList();
    var fD = new FoodDetails();

    it('should verify the food details page', function() {
        fL.go();
        fL.goFood(0);

        expect(fD.getTitle()).toBe('Coca-Cola');
        expect(fD.getPrice()).toBe('0,75 € / canette');
        expect(fD.getStock()).toBe('41 canettes');
    });

    it('should edit the SellItem', function() {
        fD.goEdition();

        fD.setSellItemName('Coca Cola');
        fD.setSellItemNamePlural('Coca Cola');

        fD.setSellItemUnit('petite canette');
        fD.setSellItemUnitPlural('petites canettes');

        fD.setSellItemUnitFactor('0.5');

        fD.setSellItemTax('40');

        fD.validateEdition();

        fD.goInfos();

        expect(fD.getTitle()).toBe('Coca Cola');
        expect(fD.getPrice()).toBe('0,44 € / petite canette');
        expect(fD.getStock()).toBe('82 petites canettes');
    });

    it('should edit the StockItems prices', function() {
        fD.goStocks();

        fD.editStockItem(0);
        fD.setStockItemPrice(0, '1');
        fD.validateStockItem(0);

        fD.editStockItem(1);
        fD.setStockItemPrice(1, '2');
        fD.validateStockItem(1);

        fD.goInfos();

        expect(fD.getPrice()).toBe('1,13 € / petite canette');
    });

    it('should edit the StockItems ratio', function() {
        fD.goStocks();

        fD.editStockItem(0);
        fD.setStockItemSellToBuy(0, '1');
        fD.validateStockItem(0);

        fD.goInfos();

        expect(fD.getPrice()).toBe('1,40 € / petite canette');
        expect(fD.getStock()).toBe('66 petites canettes');

        fD.goStocks();

        fD.editStockItem(1);
        fD.setStockItemSellToBuy(1, '1');
        fD.validateStockItem(1);

        fD.goInfos();

        expect(fD.getPrice()).toBe('2,25 € / petite canette');
        expect(fD.getStock()).toBe('41 petites canettes');
    });

    it('should re-edit the SellItem', function() {
        fD.goEdition();

        fD.setSellItemName('Coca-Cola');
        fD.setSellItemNamePlural('Coca-Cola');

        fD.setSellItemUnit('canette');
        fD.setSellItemUnitPlural('canettes');

        fD.setSellItemTax('20');

        fD.validateEdition();

        fD.goInfos();

        expect(fD.getTitle()).toBe('Coca-Cola');
        expect(fD.getPrice()).toBe('1,93 € / canette');
        expect(fD.getStock()).toBe('41 canettes');
    });
});
