var BarsBarPage = function() {
    // Gestion d'un bar
    // Aller dans un certain bar
    // Se connecter depuis un bar
    // Se déconnecter depuis un bar
    // Changer de bar
    var eLoginUsername = element(by.model('login.username'));
    var eLoginPassword = element(by.model('login.password'));
    var bConnexion = element(by.buttonText('Connexion'));

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
};
module.exports = BarsBarPage;
