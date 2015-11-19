var FoodList = function() {

	this.go = function() {
		return element(by.partialLinkText('Aliments')).click();
	};

    this.getRow = function(n) {
        return element(by.repeater("f in food_list | filter:filterItems | orderBy:list_order:reverse | limitTo: limit.nb track by f.id").row(n));
    };
    this.getRowText = function(n) {
        return this.getRow(n).getText();
    };
};
module.exports = FoodList;
