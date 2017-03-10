var FoodList = function() {

	this.go = function() {
		return element(by.partialLinkText('Aliments')).click();
	};

    this.getRow = function(n) {
        return element.all(by.repeater("f in food_list | filter:filterItems | orderBy:list_order:reverse | limitTo: limit.nb track by f.id").row(n));
    };
    this.toggleRow = function(n) {
        return this.getRow(n).first().element(by.css('a.food-list-collapse')).click();
    };
    this.getSubRow = function(n, m) {
        return this.getRow(n).get(m);
    };
    this.getSubRowText = function(n, m) {
        return this.getSubRow(n, m).getText();
    };
    this.getRowText = function(n) {
        return this.getRow(n).first().getText();
    };
    this.goFood = function(n) {
        return this.getRow(n).first().element(by.css('a[title="Voir la fiche de cet aliment"]')).click();
    };
};
module.exports = FoodList;
