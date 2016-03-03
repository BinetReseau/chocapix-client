var FoodList = require('./list.food.po.js');
var FoodDetails = require('./details.food.po.js');

describe('Food edition', function() {
    var FL = new FoodList();
    var FD = new FoodDetails();

    it('should verify the food details page', function() {
        FL.go();
        FL.goFood(0);

        expect(FD.getTitle()).toBe('Coca-Cola');
        expect(FD.getPrice()).toBe('0,75 € / canette');
        expect(FD.getStock()).toBe('41 canettes');
    });

    it('should edit the SellItem', function() {
        FD.goEdition();

        FD.setSellItemName('Coca Cola');
        FD.setSellItemNamePlural('Coca Cola');

        FD.setSellItemUnit('petite canette');
        FD.setSellItemUnitPlural('petites canettes');

        FD.setSellItemUnitFactor('0.5');

        FD.setSellItemTax('40');

        FD.validateEdition();

        FD.goInfos();

        expect(FD.getTitle()).toBe('Coca Cola');
        expect(FD.getPrice()).toBe('0,44 € / petite canette');
        expect(FD.getStock()).toBe('82 petites canettes');
    });

    it('should edit the StockItems prices', function() {
        FD.goStocks();

        FD.editStockItem(0);
        FD.setStockItemPrice(0, '1');
        FD.validateStockItem(0);

        FD.editStockItem(1);
        FD.setStockItemPrice(1, '2');
        FD.validateStockItem(1);

        FD.goInfos();

        expect(FD.getPrice()).toBe('1,13 € / petite canette');
    });

    it('should edit the StockItems ratio', function() {
        FD.goStocks();

        FD.editStockItem(0);
        FD.setStockItemSellToBuy(0, '1');
        FD.validateStockItem(0);

        FD.goInfos();

        expect(FD.getPrice()).toBe('1,40 € / petite canette');
        expect(FD.getStock()).toBe('66 petites canettes');

        FD.goStocks();

        FD.editStockItem(1);
        FD.setStockItemSellToBuy(1, '1');
        FD.validateStockItem(1);

        FD.goInfos();

        expect(FD.getPrice()).toBe('2,25 € / petite canette');
        expect(FD.getStock()).toBe('41 petites canettes');
    });

    it('should re-edit the SellItem', function() {
        FD.goEdition();

        FD.setSellItemName('Coca-Cola');
        FD.setSellItemNamePlural('Coca-Cola');

        FD.setSellItemUnit('canette');
        FD.setSellItemUnitPlural('canettes');

        FD.setSellItemTax('20');

        FD.validateEdition();

        FD.goInfos();

        expect(FD.getTitle()).toBe('Coca-Cola');
        expect(FD.getPrice()).toBe('1,93 € / canette');
        expect(FD.getStock()).toBe('41 canettes');
    });
});
