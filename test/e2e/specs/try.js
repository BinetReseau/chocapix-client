describe('angularjs homepage todo list', function() {
  it('should add a todo', function() {
    browser.manage().logs().get('browser').then(function(browserLog) {
      console.log('log: ' + require('util').inspect(browserLog));
    });
    browser.get('http://localhost:9000/#/avironjone');

    // browser.manage().logs().get('browser').then(function(browserLog) {
    //   console.log('log: ' + require('util').inspect(browserLog));
    // });

    element(by.model('login.username')).sendKeys('admin');
    element(by.model('login.password')).sendKeys('admin');
    element(by.buttonText('Connexion')).click();

    expect(element(by.buttonText('Connexion')).isDisplayed()).toBe(false);

    element(by.partialLinkText('Administration')).click();
    element(by.id('admin-food')).click();
    element(by.linkText('Ajouter un aliment')).click();

    element(by.model('data.barcode')).sendKeys('123');
    element(by.model('data.id_name')).sendKeys('Coca-Cola');
    element(by.model('data.id_container')).sendKeys('canette');
    element(by.model('data.id_container_plural')).sendKeys('s');
    element(by.model('data.id_unit')).sendKeys('cl');
    element(by.model('data.id_container_qty')).sendKeys('33');

    expect(element(by.id('admin-food-id-preview')).getText()).toEqual("Appro de 4 canettes de 33 cl de Coca-Cola");

    element(by.model('data.sei_name')).sendKeys('Coca-Cola');
    element(by.model('data.sei_unit_name')).sendKeys('canette');
    element(by.model('data.sei_unit_name_plural')).sendKeys('s');
    element(by.model('data.sti_sell_to_buy')).sendKeys('1');
    var price = element.all(by.model('data.bip_price'));
    var displayPrice = price.filter(function(elem) {
       return elem.isDisplayed();
    });
    displayPrice.sendKeys('0.5');
    // element(by.model('data.sei_tax')).sendKeys('20');

    expect(element(by.id('admin-food-sei-preview')).getText()).toEqual("Achat de 53 canettes de Coca-Cola pour 31,80 €");

    element(by.buttonText('Ajouter')).click();

    expect(element(by.repeater('alert in alerts').row(0)).getText()).toMatch(/L'aliment a été correctement créé\./);
  });
});
