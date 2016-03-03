var BarsBarPage = function() {
    // Gestion d'un bar
    // Aller dans un certain bar
    // Se connecter depuis un bar
    // Se déconnecter depuis un bar
    // Changer de bar
    var eLoginUsername = element(by.model('login.username'));
    var eLoginPassword = element(by.model('login.password'));
    var bConnexion = element(by.buttonText('Connexion'));
    var magicBar = element(by.id('magic_bar'));

    this.loadHomePage = function(bar) {
        browser.get('http://localhost:9000/#/' + bar);
    };
    this.changeToBar = function(name) {
        element(by.partialLinkText("Changer de bar")).click();
        element(by.css('a[title="Aller dans le bar ' + name + '"]')).click();
    };

    this.loginAsRespoBar = function() {
        eLoginUsername.sendKeys('admin');
        eLoginPassword.sendKeys('admin');
        bConnexion.click();

        expect(bConnexion.isDisplayed()).toBe(false);
    };
    this.setMagicBarText = function(text) {
        return magicBar
            .sendKeys(protractor.Key.SHIFT, protractor.Key.HOME, protractor.Key.NULL)
            .sendKeys(protractor.Key.BACK_SPACE)
            .sendKeys(text);
    };
    this.getTypeAheads = function(type) {
        return element.all(by.partialLinkText(type));
    };
    this.getTypeAhead = function(type, number) {
        return element.all(by.partialLinkText(type)).get(number);
    };
};
module.exports = BarsBarPage;
