describe('angularjs homepage todo list', function() {
  it('should add a todo', function() {
    browser.get('http://localhost:9000');

    element(by.model('login.username')).sendKeys('ntag');
    element(by.model('login.password')).sendKeys('ntag');
    element(by.buttonText('Connexion')).click();

    var barsOfUser = element.all(by.repeater('account in accounts'));
    expect(barsOfUser.count()).toEqual(2);
  });
});
