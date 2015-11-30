var UserCreation = require('./account.po.js');
var BarsBarPage = require('../../bar/bar.po.js');
var UserList = require('../../user/list.user.po.js');

describe('UserCreation', function() {
    var userCreation = new UserCreation();
    var userList = new UserList();
    var barsBarPage = new BarsBarPage();

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

    it('should create some accounts in Natation Jône', function() {
        barsBarPage.changeToBar('Natation Jône');
        userCreation.go();

        userCreation.setLastName("Dumas");
        userCreation.setFirstName("Grégoire");
        userCreation.setEmail("gregoire.dumas@polytechnique.edu");
        userCreation.setPseudo("La Dum");
        userCreation.setLogin("gms");
        userCreation.setPassword("gms");
        userCreation.setPasswordBis("gms");
        userCreation.setCreateSolde(70);

        userCreation.validateCreation();

        userCreation.go();

        userCreation.setLastName("Lenormand");
        userCreation.setFirstName("Augustin");
        userCreation.setEmail("augustin.lenormand@polytechnique.edu");
        userCreation.setPseudo("Toutatis");
        userCreation.setLogin("gus");
        userCreation.setPassword("gus");
        userCreation.setPasswordBis("gus");
        userCreation.setCreateSolde(50);        

        userCreation.validateCreation();

        userCreation.go();

        expect(userCreation.getImportBTNClass()).toMatch(/disabled/);
        userCreation.setImportUsername('claude');
        expect(userCreation.getImportBTNClass()).not.toMatch(/disabled/);
        userCreation.setImportSolde('25');

        userCreation.validateImportation();
        expect(userCreation.isErrorMessagePresent()).toBe(false);

        userList.go();

        var user = userList.getRowText(2);
        expect(user).toMatch(/Germain Jean-Claude/);
        expect(user).toMatch(/JC/);
        expect(user).toMatch(/25,00 €/);
    });

    it('should import some account from Natation Jône to Aviron Jône', function() {
        barsBarPage.changeToBar('Aviron Jône');

        userCreation.go();

        userCreation.setImportUsername('dumas');
        userCreation.setImportSolde('2500');
        userCreation.validateImportation();

        userCreation.go();

        userCreation.setImportUsername('aug');
        userCreation.setImportSolde('40');
        userCreation.validateImportation();

        userList.go();

        user = userList.getRowText(2);
        expect(user).toMatch(/Dumas Grégoire/);
        expect(user).toMatch(/La Dum/);
        expect(user).toMatch(/2 500,00 €/);

        user = userList.getRowText(3);
        expect(user).toMatch(/Germain Jean-Claude/);
        expect(user).toMatch(/JC/);
        expect(user).toMatch(/45,00 €/);

        user = userList.getRowText(4);
        expect(user).toMatch(/Lenormand Augustin/);
        expect(user).toMatch(/Toutatis/);
        expect(user).toMatch(/40,00 €/);

    });
});
