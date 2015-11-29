var UserCreation = require('./account.po.js');
var BarsBarPage = require('../../bar/bar.po.js');
var UserList = require('../../user/list.user.po.js');

describe('UserCreation', function() {
    var userCreation = new UserCreation();
    var userList = new UserList();

    it('should create a new user without errors', function() {
        userCreation.go();

        expect(userCreation.isErrorMessagePresent()).toBe(false);
        expect(userCreation.getCreateBTNClass()).toMatch(/disabled/);

        userCreation.setLastName("Germain");
        expect(userCreation.getCreateBTNClass()).toMatch(/disabled/);

        userCreation.setFirstName("Jean-Claude");
        expect(userCreation.getCreateBTNClass()).toMatch(/disabled/);
        expect(userCreation.getEmailClass()).toMatch(/has-error/);
        expect(userCreation.getCreateBTNClass()).toMatch(/disabled/);

        userCreation.setEmail("jean-claude.germain@polytechnique.edu");
        expect(userCreation.getCreateBTNClass()).toMatch(/disabled/);
        expect(userCreation.getEmailClass()).not.toMatch(/has-error/);

        userCreation.setPseudo("JC");
        expect(userCreation.getCreateBTNClass()).toMatch(/disabled/);

        userCreation.setLogin("admin");
        expect(userCreation.getLoginClass()).toMatch(/has-error/);
        expect(userCreation.getCreateBTNClass()).toMatch(/disabled/);

        userCreation.setLogin("grm");
        expect(userCreation.getLoginClass()).not.toMatch(/has-error/);
        expect(userCreation.getCreateBTNClass()).toMatch(/disabled/);

        userCreation.setPassword("grm");
        expect(userCreation.getPasswordClass()).toMatch(/has-error/);
        expect(userCreation.getCreateBTNClass()).toMatch(/disabled/);

        userCreation.setPasswordBis("caca");
        expect(userCreation.getPasswordClass()).toMatch(/has-error/);
        expect(userCreation.getCreateBTNClass()).toMatch(/disabled/);

        userCreation.setPasswordBis("grm");
        expect(userCreation.getPasswordClass()).not.toMatch(/has-error/);
        expect(userCreation.getCreateBTNClass()).not.toMatch(/disabled/);
        
        userCreation.setCreateSolde(0);
        expect(userCreation.getCreateBTNClass()).not.toMatch(/disabled/);

        userCreation.setCreateSolde(45);
        expect(userCreation.getCreateBTNClass()).not.toMatch(/disabled/);

        userCreation.validateCreation();
        expect(userCreation.isErrorMessagePresent()).toBe(false);

        // go check if the new user is created
        userList.go();
        var user = userList.getRowText(2);
        expect(user).toMatch(/Germain Jean-Claude/);
        expect(user).toMatch(/JC/);
        expect(user).toMatch(/45,00 €/);

    });

    // it('should import a new account from an existing user in another bar', function() {
    //     barsBarPage.changeToBar('Natation Jône');

    //     userCreation.go();
    //     expect(userCreation.isErrorMessagePresent()).toBe(false);

    // });
});
