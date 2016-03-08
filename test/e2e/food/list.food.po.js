var FoodList = function() {

		this.go = function() {
			return element(by.partialLinkText('Aliments')).click();
		};
    this.getRowByNumber = function(n) {
        return element.all(by.repeater("f in food_list | filter:filterItems | orderBy:list_order:reverse | limitTo: limit.nb track by f.id").row(n));
    };
    this.toggleRowByNumber = function(n) {
        return this.getRowByNumber(n).first().element(by.css('a.food-list-collapse')).click();
    };
    this.getSubRowByNumber = function(n, m) {
        return this.getRowByNumber(n).get(m);
    };
    this.getSubRowTextByNumber = function(n, m) {
        return this.getSubRowByNumber(n, m).getText();
    };
    this.getRowTextByNumber = function(n) {
        return this.getRowByNumber(n).first().getText();
    };
    this.goFoodByNumber = function(n) {
        return this.getRowByNumber(n).first().element(by.css('a[title="Voir la fiche de cet aliment"]')).click();
    };
};
module.exports = FoodList;
