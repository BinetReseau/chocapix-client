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


  });
});
