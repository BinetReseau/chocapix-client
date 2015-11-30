var UserList = function() {

	this.go = function() {
		return element(by.partialLinkText('Utilisateurs')).click();
	};

    this.getRow = function(n) {
        return element(by.repeater("a in account_list | filter:filterHidden() | filter:filterAccounts | orderBy:list_order:reverse").row(n));
    };
    this.getRowText = function(n) {
        return this.getRow(n).getText();
    };
};
module.exports = UserList;
